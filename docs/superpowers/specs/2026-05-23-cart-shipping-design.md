# 장바구니 및 배송비 시스템 설계

## 배경

백엔드 OpenAPI에 장바구니, 장바구니 기반 일반 아이템 배송 주문, 관리자 배송비 정책 API가 추가되었다. 프론트엔드는 `pnpm gen:api`로 `src/apis/generated/api.ts`를 재생성한 뒤 생성된 API 클라이언트를 사용한다. 생성 파일은 직접 수정하지 않는다.

현재 일반 아이템 상세 화면에는 단건 배송 주문 흐름이 있다. 이 흐름은 유지하고, 장바구니 기반 주문을 별도 흐름으로 추가한다.

## 범위

포함 범위는 다음과 같다.

- 사용자 일반 아이템 상품 상세의 `장바구니 담기` 기능
- 비회원과 회원 모두 사용할 수 있는 장바구니
- `/general-items/cart` 장바구니 확인/수정 화면
- `/general-items/cart/order` 장바구니 기반 배송 주문서 화면
- 장바구니 배송비 견적 표시
- 장바구니 기반 계좌이체 주문과 토스 결제
- `/admin/shipping-policy` 관리자 배송비 정책 조회/수정 화면
- 관련 server action, 유틸, 테스트

제외 범위는 다음과 같다.

- 전역 헤더 장바구니 아이콘 추가
- 기존 단건 배송 주문 제거 또는 대체
- 관리자 주문 목록/상세 화면의 배송비 표시 개편

## 라우트와 화면 책임

### `/general-items/[saleId]`

기존 상품 상세 화면을 유지한다. 수량 선택 영역에 `장바구니 담기` 버튼을 추가하고, 기존 `주문하기`는 `바로 주문` 의미로 유지한다. 장바구니 담기 성공 시 같은 화면에서 `장바구니 보기`와 `계속 쇼핑` 선택지를 안내한다.

### `/general-items/cart`

장바구니 확인과 수정에 집중한다.

- 장바구니 비어 있음 상태
- 상품명, 단가, 수량, 줄 금액, 삭제 버튼 표시
- 수량 변경은 장바구니 item PATCH API 사용
- 삭제는 장바구니 item DELETE API 사용
- `valid=false` 항목은 `invalidReason`을 표시
- `CartQuoteResponse` 기준으로 상품 합계, 배송비, 무료배송 기준, 무료배송 잔여 금액, 총액 표시
- 주문 가능한 항목이 없으면 주문서 이동을 차단

### `/general-items/cart/order`

장바구니 기반 배송 주문서에 집중한다.

- 기존 단건 주문서의 배송지 선택/추가 UX를 재사용하거나 공통화
- 수령인, 연락처, 주문 안내 이메일, 배송 주소, 배송 메모, 주문 메모 입력
- `CartQuoteResponse` 기준 최종 금액 요약 표시
- 장바구니 계좌이체 주문 생성
- 장바구니 토스 티켓 발급 및 결제 승인 확정

### `/admin/shipping-policy`

관리자 배송비 정책 화면을 추가한다.

- `enabled`: 배송비 정책 사용 여부
- `baseShippingFee`: 기본 배송비
- `freeShippingThreshold`: 무료배송 기준 금액
- 저장 시 server action에서 PUT API 호출 후 관리자 경로를 재검증

## API와 상태 관리

먼저 `pnpm gen:api`를 실행해 갱신된 OpenAPI 기반 타입과 함수명을 반영한다. 예상 API 경계는 다음과 같다.

- `POST /api/carts`: 장바구니 생성 또는 조회
- `GET /api/carts/current`: 현재 장바구니 조회
- `POST /api/carts/items`: 장바구니 항목 추가
- `PATCH /api/carts/items/{cartItemId}`: 수량 변경
- `DELETE /api/carts/items/{cartItemId}`: 항목 삭제
- `GET /api/carts/quote`: 장바구니 견적 조회
- `POST /api/orders/general-items/delivery/cart/bank-transfer`: 장바구니 계좌이체 주문
- `POST /api/orders/general-items/delivery/cart/toss/tickets`: 장바구니 토스 티켓 발급
- `POST /api/orders/general-items/delivery/cart/toss/confirm`: 장바구니 토스 결제 승인 확정
- `GET /api/admin/shipping-policy`: 배송비 정책 조회
- `PUT /api/admin/shipping-policy`: 배송비 정책 수정

화면 컴포넌트가 생성 API를 직접 호출하지 않도록 한다. 각 화면군의 server action이 입력 검증, 인증 토큰, `X-Cart-Token`, 쿠키 갱신, `revalidatePath`를 담당한다.

## cartToken 쿠키 정책

비회원 장바구니는 백엔드가 내려주는 `cartToken`을 앱 쿠키에 저장해 유지한다.

- 쿠키 이름은 `wn_cart_token`을 사용한다.
- 장바구니 API 호출 전 쿠키 값이 있으면 `X-Cart-Token` 헤더로 전달한다.
- 장바구니 생성/추가/조회 응답에 `cartToken`이 있으면 쿠키를 갱신한다.
- 쿠키는 `httpOnly`, `sameSite=lax`로 설정한다.
- production 환경에서는 `secure=true`를 사용한다.
- 장바구니 주문 성공 후에는 쿠키를 삭제하거나, 백엔드 응답 기준으로 장바구니가 비워진 상태를 재검증한다.

회원 사용자는 인증 토큰을 함께 전달한다. 이 경우에도 백엔드 API가 `X-Cart-Token`을 허용하므로 쿠키가 있으면 같이 전달한다.

## 오류 처리

오류 메시지는 기존 `getUserErrorMessage`와 일반 아이템 주문 흐름의 안내 방식을 따른다.

- `cartToken` 만료 또는 불일치: 장바구니를 새로 만들도록 안내하고 필요하면 쿠키를 정리한다.
- 수량 부족 또는 판매 종료: 장바구니 항목의 `invalidReason`을 표시한다.
- 빈 장바구니 주문 시도: 장바구니 화면으로 이동하도록 안내한다.
- 모든 항목이 invalid인 경우: 주문서 이동과 결제 버튼을 비활성화한다.
- 토스 SDK 로드 또는 결제 시작 실패: 기존 단건 주문과 같은 패턴으로 화면 오류를 표시한다.
- 관리자 정책 저장 실패: 폼 상단에 오류 메시지를 표시하고 입력값은 보존한다.

## 테스트 전략

TDD로 진행한다. 구현 전에 실패하는 테스트를 먼저 작성하고, 실패 이유를 확인한 뒤 최소 구현으로 통과시킨다.

우선 테스트 대상은 다음과 같다.

- `cartToken` 쿠키/헤더 유틸: 쿠키 읽기, 헤더 구성, 응답 기반 쿠키 갱신 정책
- 장바구니 액션 입력 검증: 수량, 판매 공고 ID, cart item ID 검증
- 장바구니 견적 유틸: 주문 가능 여부, invalid 항목 처리, 금액 표시 fallback
- 장바구니 주문 액션: 배송 정보 검증, 계좌이체/토스 요청 body 구성
- 관리자 배송비 정책 액션: 금액 음수 방지, 필수 필드 검증, 저장 성공/실패 결과

최종 검증은 최소 `pnpm test:run`, `pnpm lint`를 실행한다. API 재생성 후 타입 영향이 넓으면 `pnpm build`까지 확인한다.

## 승인된 결정

- 관리자 배송비 정책 화면까지 이번 범위에 포함한다.
- 비회원 장바구니를 지원한다.
- 기존 단건 `바로 주문`은 유지하고 `장바구니 담기`를 추가한다.
- 전역 헤더는 변경하지 않고 상품 상세 중심으로 장바구니 진입을 제공한다.
- 장바구니와 주문서는 `/general-items/cart`, `/general-items/cart/order`로 분리한다.
- 금액 계산은 프론트 임의 계산보다 `CartQuoteResponse`를 우선한다.
