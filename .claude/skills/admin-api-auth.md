# Admin API 인증 및 블랙리스트 관리

## 개요

서버 컴포넌트에서 인증이 필요한 Admin API를 호출하기 위한 구조와 블랙리스트 관리 기능 구현.

## 인증 구조

### 1. HTTP 클라이언트 토큰 지원 (`src/apis/index.ts`)

```typescript
// BaseOptions에 token 옵션 추가
type BaseOptions = {
  params?: Record<string, any>;
  token?: string; // Authorization Bearer 토큰
  headers?: HeadersInit;
  cache?: RequestCache;
};

// http 함수에서 토큰 처리
if (token && !h.has("Authorization")) {
  const authValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  h.set("Authorization", authValue);
}
```

### 2. 인증 토큰 헬퍼 함수 (`src/lib/auth.ts`)

```typescript
import { getServerSession } from "next-auth";

export async function getAuthToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.accessToken;
}
```

### 3. Admin API에 AuthOptions 적용 (`src/apis/apis.ts`)

```typescript
export type AuthOptions = {
  token?: string;
};

// 모든 adminApi 함수에 opts?: AuthOptions 추가
getUsers: (params?: AdminUserSearchParams, opts?: AuthOptions) =>
  http<PageResponse<AdminUserResponse>>("/api/admin/users", {
    params,
    token: opts?.token,
  }),
```

### 4. Admin 레이아웃 인증 체크 (`src/app/admin/layout.tsx`)

```typescript
export default async function AdminLayout({ children }) {
  const token = await getAuthToken();

  if (!token) {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
```

## 에러 처리

### Admin 에러 페이지 (`src/app/admin/error.tsx`)

- 403/401 에러 감지 시 "접근 권한이 없습니다" 메시지
- 다시 시도 버튼
- 홈으로 이동 버튼
- 개발 모드에서 상세 에러 정보 표시

## 블랙리스트 관리

### Server Actions (`src/app/admin/blacklist/actions.ts`)

```typescript
// 사용자 제재 추가
export async function banUserAction(userId: number, data: BanUserData);

// 제재 정보 수정
export async function editUserBanAction(userId: number, data: BanUserData);

// 제재 해제
export async function cancelUserBanAction(userId: number);
```

### 페이지 구조

```
src/app/admin/blacklist/
├── page.tsx                    # 서버 컴포넌트 (데이터 페칭)
├── actions.ts                  # Server Actions
└── _components/
    ├── BlacklistContent.tsx    # 클라이언트 컴포넌트 (UI)
    └── modals/
        ├── BlacklistFormModal.tsx    # 추가/수정 모달
        └── BlacklistDeleteModal.tsx  # 삭제 확인 모달
```

### 사용 패턴

```typescript
// 서버 컴포넌트에서 데이터 페칭
export default async function BlacklistPage({ searchParams }) {
  const token = await getAuthToken();

  const blacklist = await adminApi.getUsers(
    { isBanned: true, pageNumber: 0, pageSize: 10 },
    { token }
  );

  return <BlacklistContent blacklist={blacklist.content} />;
}

// 클라이언트 컴포넌트에서 Server Action 호출
const handleSubmit = async (data) => {
  startTransition(async () => {
    const result = await banUserAction(userId, data);
    if (result.success) {
      router.refresh();
    }
  });
};
```

## 타입 정의

### AdminUserSearchParams

```typescript
export type AdminUserSearchParams = {
  createdAtFrom?: string;
  createdAtTo?: string;
  email?: string;
  isBanned?: boolean;
  lastLoginAtFrom?: string;
  lastLoginAtTo?: string;
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  phone?: string;
  role?: string;
  sortBy?: string;
  sortDirection?: string;
  status?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  username?: string;
};
```

### UserExtInfo

```typescript
export type UserExtInfo = {
  isBanned: boolean;
  banStartDate?: string;
  banEndDate?: string;
  banReason?: string;
  privacyAgree: boolean;
  marketingAgree: boolean;
  emailAgree: boolean;
  smsAgree: boolean;
};
```

## NextAuth 설정

### 필수 환경변수 (`.env`)

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### authOptions에 secret 설정 (`src/lib/auth.ts`)

```typescript
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // ...
};
```

## 주의사항

1. **토큰 형식**: 백엔드에서 `Bearer ` 접두사 포함/미포함 모두 처리
2. **세션 쿠키**: NEXTAUTH_SECRET 변경 시 기존 쿠키 삭제 필요
3. **revalidatePath**: Server Action 후 페이지 갱신을 위해 사용
4. **router.refresh()**: 클라이언트에서 서버 컴포넌트 데이터 새로고침
