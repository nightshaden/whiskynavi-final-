# 관리자 사업자 멤버 관리 페이지 설계

Date: 2026-05-03
Topic: `/admin/businesses/members` 사업자 멤버 관리 페이지

## 요약

기존 관리자 사업자 멤버 API를 사용해 관리자 콘솔의 사업자 멤버 관리 흐름을 구현한다.

이번 기능은 다음을 포함한다.

1. `/admin/businesses/members` 의 페이지네이션 목록
2. `/admin/businesses/members/{userId}` 상세 페이지
3. 상세 페이지 내부의 read-only / edit mode 전환
4. `PATCH /api/admin/businesses/members/{userId}/business` 를 통한 사업자 정보 수정
5. 전용 POST API를 통한 pickup 권한 부여와 회수

이 작업은 현재 백엔드가 노출한 API 인터페이스를 빠짐없이 지원하되, 그 계약을 넘어서는 프론트 전용 기능은 만들지 않는다.

## 목표

- 운영자가 사용할 수 있는 사업자 멤버 목록 페이지를 추가한다.
- 빠른 조회와 빠른 액션 처리 흐름을 유지한다.
- 관리자 PATCH API가 노출한 사업자 수정 필드를 모두 지원한다.
- GET 요청은 RSC, PATCH 또는 POST 요청은 server action으로 유지한다.
- server action 단위 테스트와 클라이언트 UI 테스트를 모두 추가한다.

## 비목표

- 현재 목록 API가 지원하지 않는 프론트 전용 검색이나 필터 추가
- 사업자 멤버 전용 별도 edit 페이지 생성
- 이번 작업과 무관한 관리자 페이지 리팩터링
- 낙관적 업데이트나 별도 캐시 레이어 도입

## 현재 맥락

- `src/app/admin/businesses/members/page.tsx` 는 이미 RSC에서 멤버 목록을 조회하고 있다.
- `src/app/admin/businesses/members/[userId]/page.tsx` 는 이미 RSC에서 상세 데이터를 조회하고 있다.
- `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx` 는 현재 목록 UI와 페이지네이션 연결을 렌더링하고 있다.
- `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx` 는 현재 read-only 멤버 정보와 pickup 권한 액션을 렌더링하고 있다.
- `src/app/admin/businesses/members/[userId]/actions.ts` 는 이미 pickup 권한 부여와 회수 server action을 포함하고 있다.
- `src/apis/generated/api.ts` 는 이번 작업에 필요한 API surface를 이미 노출하고 있다.
  - `getApiAdminBusinessesMembers`
  - `getApiAdminBusinessesMembersUserid`
  - `patchApiAdminBusinessesMembersUseridBusiness`
  - `postApiAdminBusinessesMembersUseridPickupGrant`
  - `postApiAdminBusinessesMembersUseridPickupRevoke`
- 최근 `find-password` 작업은 server action 단위 테스트와 범위가 좁은 UI 테스트 패턴의 기준이 된다.

## API 계약

### 목록 API

`GET /api/admin/businesses/members`

지원하는 query interface:

- `page`
- `size`
- `sort[]`

현재 응답 shape는 다음 정도로 제한된다.

- `userId`
- `name`
- `username`
- `hasPickupRole`
- `roles`

즉 목록 페이지는 백엔드가 지원하지 않는 업체명 검색이나 추가 필터를 약속하면 안 된다.

### 상세 API

`GET /api/admin/businesses/members/{userId}`

상세 데이터는 다음을 포함한다.

- 멤버 기본 식별 정보
- role 정보
- pickup 권한 상태
- 사업자명, 사업자등록번호, 사업 유형, 연락처, 주소, 생성일, 수정일 같은 사업자 필드

### 수정 API

`PATCH /api/admin/businesses/members/{userId}/business`

수정 가능한 필드:

- `businessName`
- `businessRegistrationNumber`
- `businessType`
- `contact`
- `pickupAddress`

중요한 계약:

- `null` 은 기존 값을 유지한다.
- `contact` 에 빈 문자열을 보내면 저장된 연락처를 비운다.

### Pickup 권한 API

- `POST /api/admin/businesses/members/{userId}/pickup/grant`
- `POST /api/admin/businesses/members/{userId}/pickup/revoke`

이 둘은 수정 폼에 합치지 않고 전용 액션으로 유지한다.

## 권장 접근

기존 라우트 구조를 유지하면서 현재 구현을 확장한다.

- 목록과 상세 조회는 계속 RSC `page.tsx` 에서 처리한다.
- 모든 변경 요청은 server action에서 처리한다.
- 기존 상세 클라이언트 컴포넌트에 명시적인 edit mode를 추가한다.
- 먼저 server action 단위 테스트를 추가하고, 그 다음 수정 동작을 구현하고, 마지막으로 UI 테스트를 보강한다.

이 방식이 API 계약과 운영 흐름을 지키면서도 가장 단순한 구현이다.

## 정보 구조

### `/admin/businesses/members`

책임:

- 사업자 멤버 목록을 페이지네이션으로 보여준다.
- 페이지 이동을 노출한다.
- 페이지 크기 조절 UI를 노출한다.
- 필요하면 지원되는 `sort[]` 인터페이스에 매핑되는 최소 수준의 정렬 선택 UI를 노출한다.
- 행 클릭으로 상세 페이지에 진입시킨다.

이 페이지는 목록 역할에 집중하고, 테이블 안에서 수정 액션까지 직접 수행하지 않는다.

### `/admin/businesses/members/{userId}`

책임:

- 기본적으로 read-only 멤버와 사업자 정보를 보여준다.
- 같은 페이지 안에서 edit mode로 전환할 수 있게 한다.
- 같은 화면에서 pickup 권한 부여와 회수를 처리한다.
- 목록으로 빠르게 돌아갈 수 있게 한다.

이 구조는 목록 탐색 → 상세 확인 → 즉시 액션 → 목록 복귀라는 운영 흐름을 유지한다.

## RSC 와 Server Action 경계

### RSC 책임

다음 조회는 RSC에서 처리한다.

- `GET /api/admin/businesses/members`
- `GET /api/admin/businesses/members/{userId}`

이유:

- 현재 관리자 라우트 구조와 일치한다.
- 초기 렌더 데이터를 서버에서 바로 준비할 수 있다.
- 보호된 관리자 페이지에서 클라이언트 부트스트랩 복잡도를 줄일 수 있다.

### Server Action 책임

다음 변경은 server action에서 처리한다.

- `PATCH /api/admin/businesses/members/{userId}/business`
- `POST /api/admin/businesses/members/{userId}/pickup/grant`
- `POST /api/admin/businesses/members/{userId}/pickup/revoke`

이유:

- 토큰 처리와 사용자용 에러 메시지 정규화를 한 곳에 모을 수 있다.
- `revalidatePath` 와 mutation side effect를 같은 경계에서 관리할 수 있다.
- 최근 `find-password` 작업에서 쓴 프로젝트 패턴과 맞다.

## 목록 페이지 설계

### 데이터 흐름

- `page.tsx` 가 `page`, `limit` 또는 `size`, 정렬 관련 search params를 읽는다.
- 이를 generated API parameter shape로 변환한다.
- `getApiAdminBusinessesMembers(...)` 를 호출한다.
- 응답을 `BusinessMembersContent` 에 전달한다.

### UI 동작

- 제목과 총 건수를 보여준다.
- 데이터가 없으면 empty state를 렌더링한다.
- 행 클릭으로 상세 페이지에 이동한다.
- 페이지네이션은 유지한다.
- 아직 없다면 명시적인 페이지 크기 조절 UI를 추가한다.
- 정렬 UI를 추가할 경우, 한 번에 하나의 backend sort 값에 직접 매핑되는 최소 수준으로 유지한다.

### 의도적으로 제외하는 것

- 검색창 없음
- pickup 권한 필터 없음
- 업체명 필터 없음

이 기능들은 현재 목록 API가 지원하지 않기 때문에 범위에서 제외한다.

## 상세 페이지 설계

### 기본 모드

페이지는 read-only mode로 열리고 다음을 보여준다.

- 멤버 정보 섹션
- 사업자 정보 섹션
- pickup 권한 badge
- pickup 권한 액션 버튼
- 목록 복귀 버튼
- 수정 진입 버튼

### Edit Mode

운영자가 `수정` 을 누르면:

- 같은 페이지 레이아웃을 유지한다.
- 수정 가능한 사업자 필드만 입력 컴포넌트로 바뀐다.
- 멤버 식별 정보는 계속 read-only 상태로 둔다.
- `저장` 과 `취소` 버튼을 보여준다.

수정 가능한 폼 필드:

- `businessName`
- `businessRegistrationNumber`
- `businessType`
- `contact`
- `pickupAddress`

`businessType` 은 다음 매핑의 select로 보여준다.

- `HOUSEHOLD` → `가정용`
- `ENTERTAINMENT` → `유흥용`

### 저장과 취소 동작

- `저장` 은 현재 폼 값을 update server action으로 전달한다.
- 저장 성공 시 edit mode를 종료하고 최신 상세 데이터를 다시 보여준다.
- `취소` 시 수정 중 값은 버리고 read-only mode로 복귀한다.
- 저장 실패 시 edit mode를 유지하고 사용자가 입력한 값도 유지한다.

### Edit Mode 중 Pickup 권한

pickup 권한 액션은 수정 폼과 시각적으로 분리한다.

권장 동작:

- edit mode가 활성화된 동안 pickup 권한 버튼은 비활성화하거나 숨긴다.

이렇게 해야 성격이 다른 mutation 두 개를 같은 순간에 섞지 않아 운영자 혼동을 줄일 수 있다.

## Server Action 설계

### `updateBusinessAction(userId, input)`

책임:

- 수정 가능한 payload를 검증하고 정규화한다.
- `patchApiAdminBusinessesMembersUseridBusiness` 를 호출한다.
- `{ success: boolean; error?: string }` 을 반환한다.
- 다음 경로를 revalidate 한다.
  - `/admin/businesses/members`
  - `/admin/businesses/members/{userId}`

메모:

- 비워진 `contact` 는 의도적인 빈 문자열로 취급한다.
- 관련 없는 필드는 보내지 않는다.

### `grantPickupRoleAction(userId)`

책임:

- grant endpoint를 호출한다.
- 목록과 상세 경로를 revalidate 한다.
- 성공 또는 사용자용 에러를 반환한다.

### `revokePickupRoleAction(userId)`

책임:

- revoke endpoint를 호출한다.
- 목록과 상세 경로를 revalidate 한다.
- 성공 또는 사용자용 에러를 반환한다.

## 검증과 에러 처리

### 수정값 검증

- `businessName`: 명백한 프론트 검증 규칙이 이미 없다면 기존 backend 규칙을 우선한다.
- `businessRegistrationNumber`: backend가 강제하지 않는 이상 raw string 입력을 유지한다.
- `businessType`: generated enum 두 값으로 제한한다.
- `contact`: 비우기 동작을 위해 빈 문자열을 허용한다.
- `pickupAddress`: 자유 텍스트를 허용한다.

즉 이번 작업은 backend 계약을 넘는 과도한 프론트 검증을 하지 않는다.

### 에러 처리

- mutation 실패는 action 경계에서 사용자용 에러 문자열로 반환한다.
- 상세 폼은 저장 실패 시 사용자가 입력한 값을 유지한다.
- pickup 권한 실패 시 다른 페이지 상태를 초기화하거나 강제 이동하지 않는다.

## 테스트 전략

`find-password` 와 같은 패턴을 따른다. 먼저 action 경계를 고정하고, 그 다음 UI 동작을 검증한다.

### Server Action 단위 테스트

상세 페이지 actions 전용 테스트 파일을 추가한다.

포함할 테스트 범위:

- update action이 유효한 payload로 성공한다.
- update action이 validation 또는 fallback error를 올바르게 반환한다.
- update action이 PATCH API를 기대한 payload로 호출한다.
- update action이 목록과 상세 경로를 모두 revalidate 한다.
- grant action이 올바른 POST API를 호출하고 경로를 revalidate 한다.
- revoke action이 올바른 POST API를 호출하고 경로를 revalidate 한다.
- mutation 실패 시 안정적인 fallback message를 반환한다.

### 클라이언트 UI 테스트

목록 컴포넌트 테스트:

- 제목 렌더링
- empty state 렌더링
- 총 건수 렌더링
- 멤버 행 렌더링
- 페이지네이션 유지 확인

상세 컴포넌트 테스트:

- read-only 뷰에서 멤버와 사업자 정보 렌더링
- `hasPickupRole` 값에 따른 pickup 버튼 분기
- edit mode 진입
- edit mode에서 입력 컨트롤 렌더링
- 취소 시 read-only mode 복귀

server action과 client UI는 분리해서 테스트해 각 레이어의 책임을 명확히 유지한다.

## 파일 계획

- 수정 `src/app/admin/businesses/members/page.tsx`
- 수정 `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx`
- 수정 `src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx`
- 수정 `src/app/admin/businesses/members/[userId]/page.tsx`
- 수정 `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx`
- 수정 `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx`
- 수정 `src/app/admin/businesses/members/[userId]/actions.ts`
- 추가 `src/app/admin/businesses/members/[userId]/actions.test.ts`

별도 edit route는 만들지 않는다.

## 리스크와 제약

- 목록 API는 현재 페이지네이션과 정렬만 지원하므로, UI가 더 풍부한 검색 기능을 암시하면 안 된다.
- 기존 상세 UI에는 이미 pickup 권한 액션이 있으므로, edit mode 통합 시 액션 충돌이나 시각적 혼잡을 막아야 한다.
- PATCH payload를 만들 때 generated API 주석의 `null` 유지 규칙을 존중해야 한다.
- 이미 부분 구현된 기능을 확장하는 작업이므로, 기존 pickup 권한 동작에 대한 회귀 테스트가 중요하다.

## 완료 기준

- `/admin/businesses/members` 에서 동작하는 페이지네이션 목록을 볼 수 있다.
- 운영자가 목록에서 상세 페이지로 이동할 수 있다.
- 상세 페이지는 기본적으로 read-only 사업자 멤버 정보를 보여준다.
- 운영자가 같은 페이지에서 edit mode로 들어갈 수 있다.
- 운영자가 PATCH API가 노출한 모든 사업자 필드를 수정할 수 있다.
- 운영자가 상세 페이지에서 pickup 권한을 부여하거나 회수할 수 있다.
- GET 요청은 계속 RSC에 남아 있다.
- PATCH 와 POST 요청은 server action으로 처리된다.
- server action에 전용 단위 테스트가 있다.
- 기존 및 신규 UI 동작이 범위가 좁은 컴포넌트 테스트로 검증된다.

## 후속 범위

- backend가 query parameter를 추가한 뒤의 검색 지원
- 목록 페이지의 추가 role 필터
- 관리자 변경 이력 UI
- 멤버 일괄 액션
