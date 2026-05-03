# Find Password Design

Date: 2026-05-03
Topic: `/find-password` temporary password reset flow

## Summary

Implement a public, single-page password reset flow for the existing `비밀번호 초기화` link in the sign-in screen.

The flow is:

1. User enters an email address.
2. Frontend sends a reset verification code through `/api/auth/email-verification/reset/send`.
3. User enters the verification code.
4. Frontend verifies the code through `/api/auth/email-verification/reset/verify`.
5. If verification succeeds, the frontend immediately triggers `/api/auth/reset-password`.
6. Backend sends a temporary password to the verified email address.

The UI will stay on a single page and progress through local state transitions rather than route changes.

## Goals

- Make the existing `/find-password` link functional.
- Keep the flow simple and consistent with the current sign-in experience.
- Reuse the existing email verification interaction pattern already present in the codebase.
- Show a specific error when the email is not registered: `가입되지 않은 이메일입니다`.
- Automatically trigger password reset immediately after successful verification.

## Non-Goals

- Letting users set a new password directly in the frontend.
- Adding multi-page routing for each step.
- Introducing authenticated-only logic or session dependencies.
- Refactoring unrelated auth screens.

## Existing Context

- `src/app/(main)/sign-in/SignInForm.tsx` already links to `/find-password`.
- `src/app/(main)/my-page/_components/ProfileEditForm.tsx` already implements a similar email verification UI pattern with step-based client state.
- `src/app/(main)/my-page/actions.ts` already shows the preferred server action style for API calls and user-facing error handling.
- `src/apis/generated/api.ts` already exposes:
  - `postApiAuthEmailVerificationResetSend`
  - `postApiAuthEmailVerificationResetVerify`
  - `postApiAuthResetPassword`
- Generated API types indicate `postApiAuthResetPassword` only accepts `email`, which matches the temporary-password-by-email behavior.

## Recommended Approach

Use a single route with a dedicated page and one client form component:

- `src/app/(main)/find-password/page.tsx`
- `src/app/(main)/find-password/_components/FindPasswordForm.tsx`
- `src/app/(main)/find-password/actions.ts`

This keeps the implementation aligned with current App Router patterns, minimizes state transfer complexity, and avoids unnecessary route decomposition.

## User Experience

### Initial State

- The page uses a layout close to the current sign-in screen for visual consistency.
- The form shows:
  - email input
  - `인증코드 발송` button

### After Code Send Success

- The form reveals:
  - verification code input
  - `확인` button
- A neutral or info message explains that the code was sent to the email address.

### After Verification Success

- The frontend immediately calls the reset-password action without requiring another click.
- While reset is in progress, the verification UI stays disabled and shows a pending message.

### Completion State

- The page shows a success message that a temporary password was sent by email.
- The page provides a clear CTA back to `/sign-in`.

## Client State Model

The form should manage a focused state machine:

- `idle`
- `code-sent`
- `resetting`
- `completed`

Additional local state:

- `email: string`
- `code: string`
- `error: string | null`
- `isPending: boolean` or transition pending state

Notes:

- A separate `verified` state is unnecessary because verification success immediately transitions into reset execution.
- If the email changes after a code was sent, the form resets back to `idle` and clears the code field and prior transient messages.

## Server Action Design

Use two server actions in `src/app/(main)/find-password/actions.ts`.

### `sendResetCode(email: string)`

Responsibilities:

- Validate email format.
- Call `postApiAuthEmailVerificationResetSend({ email })`.
- Return `{ success: boolean; error?: string }`.

Behavior:

- Success: client transitions to `code-sent`.
- Failure: surface API-derived error message.
- If backend reports the email is not registered, the UI shows `가입되지 않은 이메일입니다`.

### `verifyAndResetPassword(email: string, code: string)`

Responsibilities:

- Validate email and code presence.
- Call `postApiAuthEmailVerificationResetVerify({ email, code })`.
- If verification succeeds, immediately call `postApiAuthResetPassword({ email })`.
- Return `{ success: boolean; error?: string }`.

Behavior:

- If verification fails, do not call reset.
- If verification succeeds but reset fails, return an error and keep the user on the verification step instead of moving to completion.
- Success only means both API calls finished successfully.

This keeps the "verification success immediately triggers reset" rule on the server-action boundary rather than duplicating orchestration in the client.

## Validation Rules

- Email:
  - must be present
  - must match the existing email format expectations used elsewhere in the project
- Verification code:
  - must be present
  - no extra formatting assumptions unless backend explicitly requires them

No new password validation is needed because the frontend does not collect a replacement password.

## Error Handling

### Send Step

- Empty email: `이메일을 입력해주세요.`
- Invalid email format: `올바른 이메일 형식이 아닙니다.`
- Unregistered email: `가입되지 않은 이메일입니다`
- Other backend/network issue: fallback such as `인증 코드 발송에 실패했습니다.`

### Verify Step

- Empty code: `인증 코드를 입력해주세요.`
- Invalid or mismatched code: fallback such as `인증 코드가 올바르지 않습니다.`

### Reset Step

- Verification succeeded but reset failed:
  - show `임시 비밀번호 발급에 실패했습니다. 잠시 후 다시 시도해주세요.`
  - keep the form in the code entry step
  - do not show completion state

## UI Composition

### `src/app/(main)/find-password/page.tsx`

Responsibilities:

- Render the page shell.
- Reuse the sign-in page's visual structure where practical.
- Mount `FindPasswordForm`.

### `src/app/(main)/find-password/_components/FindPasswordForm.tsx`

Responsibilities:

- Manage step transitions.
- Collect email and verification code input.
- Trigger the two server actions.
- Render loading, success, and error messages.
- Lock or disable controls during in-flight requests.

Implementation style should stay close to existing client forms in the repo and avoid introducing a heavy form library for this narrow flow.

## File Plan

- Add `src/app/(main)/find-password/page.tsx`
- Add `src/app/(main)/find-password/_components/FindPasswordForm.tsx`
- Add `src/app/(main)/find-password/actions.ts`

Potential reuse:

- Existing `Input`, `Button`, `Label`, and `FormMessage` UI components
- Validation patterns from `src/app/(main)/sign-up/schemas.ts`
- Interaction pattern from `src/app/(main)/my-page/_components/ProfileEditForm.tsx`

## Testing Strategy

Keep testing scope focused on behavior that can regress.

### Server Action Tests

- `sendResetCode` returns success on valid API success
- `sendResetCode` returns the unregistered-email error when backend rejects unknown email
- `verifyAndResetPassword` succeeds only when verify and reset both succeed
- `verifyAndResetPassword` does not call reset when verify fails
- `verifyAndResetPassword` returns reset failure when verify succeeds but reset fails

### UI Tests

- Code input appears after successful send
- Error message renders when send fails
- Error message renders when code verification fails
- Completion message renders after verify + automatic reset success
- Sign-in CTA renders in the completed state

## Risks and Constraints

- Backend error messages must be mapped carefully so `가입되지 않은 이메일입니다` is shown intentionally and not hidden by a generic fallback.
- Because reset is auto-triggered after verification, loading state must make this second request visible enough that the UI does not appear frozen.
- The generated API comments around reset/email verification mention signup in some places; implementation should trust endpoint usage and request shapes, not those inconsistent comments.

## Acceptance Criteria

- Clicking `비밀번호 초기화` from sign-in leads to a working `/find-password` page.
- Users can request a reset verification code with their email.
- Users see `가입되지 않은 이메일입니다` for unknown emails.
- Users can submit a verification code.
- Verification success automatically triggers temporary password reset.
- Success state clearly tells users a temporary password was emailed.
- Users can navigate back to sign-in from the completion state.

## Out of Scope Follow-Ups

- Resend cooldown timer
- Rate-limit UX
- Code expiration countdown
- Dedicated analytics instrumentation

These can be added later if product requirements expand, but are not required for the current implementation.
