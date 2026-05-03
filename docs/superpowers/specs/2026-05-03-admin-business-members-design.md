# Admin Business Members Design

Date: 2026-05-03
Topic: `/admin/businesses/members` business member management page

## Summary

Implement the admin business member management flow using the existing admin businesses member APIs.

The feature includes:

1. A paginated member list at `/admin/businesses/members`
2. A member detail page at `/admin/businesses/members/{userId}`
3. Inline read-only and edit-mode switching on the detail page
4. Business information updates through `PATCH /api/admin/businesses/members/{userId}/business`
5. Pickup role grant and revoke actions through dedicated POST endpoints

This work should support the full currently exposed API interface without inventing frontend-only business capabilities beyond that contract.

## Goals

- Add a usable admin business member list page for operators.
- Preserve fast lookup and fast action handling for support and operations work.
- Support the full editable business payload currently exposed by the admin PATCH API.
- Keep GET requests in RSC and PATCH or POST requests in server actions.
- Add unit tests for server actions and UI tests for client rendering and mode transitions.

## Non-Goals

- Adding frontend-only search or filters not supported by the current list API.
- Creating a separate edit page for business members.
- Refactoring unrelated admin pages.
- Introducing optimistic updates or local cache layers.

## Existing Context

- `src/app/admin/businesses/members/page.tsx` already fetches the member list through RSC.
- `src/app/admin/businesses/members/[userId]/page.tsx` already fetches detail data through RSC.
- `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx` already renders the current list UI with pagination wiring.
- `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx` already renders read-only member and business information plus pickup role actions.
- `src/app/admin/businesses/members/[userId]/actions.ts` already contains pickup grant and revoke server actions.
- `src/apis/generated/api.ts` exposes the relevant API surface:
  - `getApiAdminBusinessesMembers`
  - `getApiAdminBusinessesMembersUserid`
  - `patchApiAdminBusinessesMembersUseridBusiness`
  - `postApiAdminBusinessesMembersUseridPickupGrant`
  - `postApiAdminBusinessesMembersUseridPickupRevoke`
- The recent `find-password` work establishes the preferred pattern for server action unit tests and focused UI tests.

## API Contract

### List API

`GET /api/admin/businesses/members`

Supported query interface:

- `page`
- `size`
- `sort[]`

Current response shape is limited to:

- `userId`
- `name`
- `username`
- `hasPickupRole`
- `roles`

This means the list page should not promise business-name search or richer filters that the backend does not currently support.

### Detail API

`GET /api/admin/businesses/members/{userId}`

Detail data includes:

- member identity fields
- role information
- pickup-role state
- business fields such as name, registration number, type, contact, address, and timestamps

### Update API

`PATCH /api/admin/businesses/members/{userId}/business`

Editable fields:

- `businessName`
- `businessRegistrationNumber`
- `businessType`
- `contact`
- `pickupAddress`

Important contract detail:

- `null` means keep current value
- empty string for `contact` means clear the stored contact value

### Pickup Role APIs

- `POST /api/admin/businesses/members/{userId}/pickup/grant`
- `POST /api/admin/businesses/members/{userId}/pickup/revoke`

These remain dedicated actions rather than being merged into the edit form.

## Recommended Approach

Use the existing route structure and enhance the current implementation rather than rebuilding it.

- Keep list and detail data fetching in RSC `page.tsx` files.
- Keep all mutations in server actions.
- Extend the existing detail client component with an explicit edit mode.
- Add server action unit tests first, then implement update behavior, then update UI tests.

This is the minimal approach that still honors the API contract and operator workflow.

## Information Architecture

### `/admin/businesses/members`

Responsibilities:

- show a paginated list of business members
- expose page navigation
- expose page size control
- optionally expose a minimal sort selector tied to the supported `sort[]` interface
- route to member detail on row click

The page should stay list-focused and not embed edit actions directly into the table.

### `/admin/businesses/members/{userId}`

Responsibilities:

- show read-only member and business information by default
- allow operators to switch into edit mode on the same page
- allow pickup role grant or revoke from the same screen
- provide a quick path back to the list page

This preserves the current operational flow: browse list, inspect detail, act immediately, return when done.

## RSC and Server Action Boundaries

### RSC Responsibilities

Use RSC for:

- `GET /api/admin/businesses/members`
- `GET /api/admin/businesses/members/{userId}`

Reasons:

- aligns with current admin route structure
- keeps initial data loading on the server
- avoids client-side bootstrapping for protected admin pages

### Server Action Responsibilities

Use server actions for:

- `PATCH /api/admin/businesses/members/{userId}/business`
- `POST /api/admin/businesses/members/{userId}/pickup/grant`
- `POST /api/admin/businesses/members/{userId}/pickup/revoke`

Reasons:

- centralizes token handling and user-facing error normalization
- keeps mutation side effects close to `revalidatePath`
- matches the project pattern used in recent work such as `find-password`

## List Page Design

### Data Flow

- `page.tsx` reads `page`, `limit` or `size`, and sort-related search params
- converts them into the generated API parameter shape
- calls `getApiAdminBusinessesMembers(...)`
- passes the response into `BusinessMembersContent`

### UI Behavior

- show title and total count
- render empty state when no members exist
- keep row click behavior for detail navigation
- preserve pagination
- add an explicit page-size control if not already exposed
- if sort UI is added, keep it minimal and directly mapped to one supported backend sort value at a time

### Intentional Omissions

- no search box
- no pickup-role filter
- no business-name filter

These are omitted because the current list API does not support them.

## Detail Page Design

### Default Mode

The page opens in read-only mode and shows:

- member section
- business section
- pickup role badge
- pickup role action button
- back navigation
- edit trigger

### Edit Mode

When the operator clicks `수정`:

- the same page layout stays in place
- editable business fields switch to form controls
- member identity fields remain read-only
- the page shows `저장` and `취소`

Editable form fields:

- `businessName`
- `businessRegistrationNumber`
- `businessType`
- `contact`
- `pickupAddress`

`businessType` should be shown as a select with Korean labels mapped from:

- `HOUSEHOLD` → `가정용`
- `ENTERTAINMENT` → `유흥용`

### Save and Cancel Behavior

- `저장` calls the update server action with the current form values
- successful save exits edit mode and refreshes the rendered detail state
- `취소` discards local edits and returns to read-only mode
- failed save keeps the user in edit mode and preserves entered values

### Pickup Role During Edit

Pickup role actions should be visually separated from form editing.

Recommended behavior:

- disable or hide pickup role buttons while edit mode is active

This avoids combining two different mutation types in the same moment and reduces operator confusion.

## Server Action Design

### `updateBusinessAction(userId, input)`

Responsibilities:

- validate and normalize the editable payload
- call `patchApiAdminBusinessesMembersUseridBusiness`
- return `{ success: boolean; error?: string }`
- revalidate:
  - `/admin/businesses/members`
  - `/admin/businesses/members/{userId}`

Notes:

- treat cleared `contact` as an intentional empty string
- avoid sending unrelated fields

### `grantPickupRoleAction(userId)`

Responsibilities:

- call the grant endpoint
- revalidate list and detail paths
- return success or user-facing error

### `revokePickupRoleAction(userId)`

Responsibilities:

- call the revoke endpoint
- revalidate list and detail paths
- return success or user-facing error

## Validation and Error Handling

### Update Validation

- `businessName`: allow existing backend rules to remain authoritative unless obvious frontend validation already exists elsewhere
- `businessRegistrationNumber`: preserve raw string input unless the backend requires strict formatting
- `businessType`: restrict to the two generated enum values
- `contact`: allow empty string to support clearing
- `pickupAddress`: allow free text

This work should avoid over-validating beyond the backend contract.

### Error Handling

- mutation failures should return user-facing error text from the action boundary
- detail form should keep user input on save failure
- pickup role failures should not navigate away or reset unrelated page state

## Testing Strategy

Follow the pattern proven in `find-password`: lock action boundaries first, then verify UI behavior.

### Server Action Unit Tests

Add a dedicated test file for detail-page actions.

Test coverage should include:

- update action succeeds with valid payload
- update action returns validation or fallback errors correctly
- update action calls the PATCH API with the expected payload
- update action revalidates both list and detail paths
- grant action calls the correct POST API and revalidates paths
- revoke action calls the correct POST API and revalidates paths
- mutation failures return stable fallback messages

### Client UI Tests

List component tests:

- title renders
- empty state renders
- total count renders
- member rows render correctly
- pagination remains visible

Detail component tests:

- read-only view renders member and business fields
- pickup role button changes by `hasPickupRole`
- edit mode toggles on
- editable controls appear in edit mode
- cancel returns to read-only mode

Server actions and client UI should be tested separately so each layer has one clear responsibility.

## File Plan

- Update `src/app/admin/businesses/members/page.tsx`
- Update `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx`
- Update `src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx`
- Update `src/app/admin/businesses/members/[userId]/page.tsx`
- Update `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx`
- Update `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx`
- Update `src/app/admin/businesses/members/[userId]/actions.ts`
- Add `src/app/admin/businesses/members/[userId]/actions.test.ts`

No separate edit route is required.

## Risks and Constraints

- The list API currently supports only pagination and sorting, so the page must not imply richer search capabilities.
- Existing detail UI already contains pickup-role actions, so edit mode integration should avoid clutter or conflicting action states.
- The generated API comment about `null` preserving current values should be respected when shaping the PATCH payload.
- Because the work extends an already partially implemented feature, tests must protect against regressions in existing pickup-role behavior.

## Acceptance Criteria

- `/admin/businesses/members` shows a working paginated member list.
- Operators can navigate from the list to a member detail page.
- Detail page shows read-only business member information by default.
- Operators can enter edit mode on the same detail page.
- Operators can update all business fields exposed by the PATCH API.
- Operators can grant or revoke pickup role from the detail page.
- GET requests remain in RSC.
- PATCH and POST requests are handled by server actions.
- Server actions have dedicated unit tests.
- Existing and new UI behavior is covered by focused component tests.

## Out of Scope Follow-Ups

- Search support once the backend adds query parameters
- Additional role filters on the list page
- Audit trail UI for admin changes
- Bulk member actions
