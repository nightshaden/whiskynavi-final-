import { http } from "./index";

// ============================================================================
// Common Types
// ============================================================================

export type PageableSort = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};

export type Pageable = {
  pageNumber: number;
  pageSize: number;
  sort: PageableSort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
};

export type PageResponse<T> = {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: PageableSort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
};

export type PageParams = {
  page?: number;
  size?: number;
  sort?: string[];
};

// ============================================================================
// Auth Types
// ============================================================================

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  username: string;
  userInfo: UserSelfResponse;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  username: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  privacyAgree: boolean;
  marketingAgree: boolean;
  emailAgree: boolean;
  smsAgree: boolean;
  snsAgree: boolean;
};

export type AvailabilityResponse = {
  available: boolean;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type EmailVerificationRequest = {
  email: string;
};

export type EmailVerificationVerifyRequest = {
  email: string;
  code: string;
};

export type ResetPasswordResponse = {
  message: string;
};

// ============================================================================
// User Types
// ============================================================================

export type UserRole =
  | "ROLE_GUEST" // 비회원
  | "ROLE_USER" // 일반 회원
  | "ROLE_ADMIN" // 관리자
  | "ROLE_SUPER_ADMIN" // 총괄 관리자
  | "ROLE_CONSUMER" // 소비자
  | "ROLE_WHISKYNAVI_MEMBER" // 위스키내비 멤버
  | "ROLE_WHISKYTALES_MEMBER" // 위스키테일즈 멤버
  | "ROLE_BLIND_MEMBER" // 블라인드 테이스팅 멤버
  | "ROLE_BUSINESS" // 업장
  | "ROLE_TRAILNTALE_BUSINESS" // 트레일 테일 업장
  | "ROLE_COMMUNITY_BUSINESS" // 커뮤니티 업장
  | "ROLE_PICK_UP_BUSINESS"; // 픽업 업장

export type UserSelfResponse = {
  id: number;
  email: string;
  name: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  roles: UserRole[];
  isBanned: boolean;
  banStartDate?: string;
  banEndDate?: string;
  banReason?: string;
  privacyAgree: boolean;
  marketingAgree: boolean;
  emailAgree: boolean;
  smsAgree: boolean;
  snsAgree: boolean;
};

export type BlacklistRequest = {
  reason: string;
  startAt: string;
  endAt: string | null;
};

export type AdminUserResponse = {
  id: number;
  email: string;
  username: string;
  name: string;
  phone?: string;
  status: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  userExt?: UserExtInfo;
};

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

// ============================================================================
// Business Types
// ============================================================================

export type UserBusinessApplicationRequest = {
  businessName: string;
  businessRegistrationNumber: string;
  contact: string;
  pickupAddress: string;
};

export type UserBusinessApplicationResponse = {
  id: number;
  userId: number;
  businessName: string;
  businessRegistrationNumber: string;
  contact: string;
  pickupAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type PickupLocationResponse = {
  id: number;
  businessName: string;
  contact: string;
  pickupAddress: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminBusinessUserResponse = {
  userId: number;
  username: string;
  name: string;
  roles: UserRole[];
  hasPickupRole: boolean;
};

// ============================================================================
// Bottle Types
// ============================================================================

export type Bottle = {
  id: number;
  name: string;
  company?: string;
  brand?: string;
  series?: string;
  imgUrl?: string;
  extraInfos?: Record<string, string>;
  maltType?: string;
  distillery?: string;
  distillationDate?: string;
  bottledDate?: string;
  caskType?: string;
  caskNumber?: string;
  abv?: number;
  capacity?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type BottleAdminResponse = Bottle & {
  stockQuantity?: number;
  supplyPrice?: number;
  consumerPrice?: number;
};

export type BottleSearchParams = {
  name?: string;
  company?: string;
  brand?: string;
  series?: string;
  maltType?: string;
  distillery?: string;
  caskType?: string;
  abvFrom?: number;
  abvTo?: number;
  vintageFrom?: number;
  vintageTo?: number;
  bottledDateFrom?: string;
  bottledDateTo?: string;
  distillationDateFrom?: string;
  distillationDateTo?: string;
  pageNumber?: number;
  pageSize?: number;
  sort?: string;
};

export type BottleSearchParameterValues = {
  names: string[];
  companies: string[];
  brands: string[];
  series: string[];
  maltTypes: string[];
  distilleries: string[];
  caskTypes: string[];
};

// Legacy aliases for backward compatibility
export type BottleQueries = BottleSearchParams;
export type BottleParams = BottleSearchParameterValues;
export type BottleResponse = PageResponse<Bottle>;

// ============================================================================
// Bottle Reservation Types
// ============================================================================

export type ReservationApplicationStatus =
  | "APPLIED"
  | "CANCELLED"
  | "CONFIRMED"
  | "WAITING_PICKUP"
  | "RECEIVED"
  | "REJECTED";

export type BottleReservationGradeCondition = {
  applicableFrom: string;
  requiredRole: UserRole;
};

export type BottleReservationNoticeResponse = {
  id: number;
  bottleId: number;
  bottleName: string;
  price: number;
  reservationStartAt: string;
  reservationEndAt: string;
  gradeConditions: BottleReservationGradeCondition[];
  createdAt: string;
  updatedAt: string;
};

export type BottleReservationApplicationRequest = {
  quantity: number;
  userBusinessId: number;
};

export type BottleReservationApplicationResponse = {
  id: number;
  noticeId: number;
  bottleId: number;
  bottleName: string;
  quantity: number;
  confirmedQuantity?: number;
  pickupUserBusinessId: number;
  status: ReservationApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type BottleReservationNoticeRequest = {
  bottleId: number;
  price: number;
  reservationStartAt: string;
  reservationEndAt: string;
  gradeConditions?: BottleReservationGradeCondition[];
};

// ============================================================================
// Order Types
// ============================================================================

export type OrderType = "RESERVATION" | "PICKUP" | "GENERAL";
export type ProductType = "BOTTLE" | "MERCH";
export type OrderStatus =
  | "ORDER_REQUESTED"
  | "PAYMENT_PENDING"
  | "ORDER_PREPARING"
  | "SHIPPING"
  | "DELIVERY_COMPLETED"
  | "RECEIPT_PENDING"
  | "RECEIPT_COMPLETED"
  | "ORDER_CANCELED"
  | "REFUND_REQUESTED"
  | "REFUND_COMPLETED";

export type OrderCreateRequest = {
  userId: number;
  saleAnnouncementId?: number;
  saleTitle?: string;
  saleType?: OrderType;
  orderType: OrderType;
  productId: number;
  productType: ProductType;
  itemName: string;
  unitPrice: number;
  requestedQuantity: number;
  businessId?: number;
  importerId?: number;
  orderNote?: string;
};

export type OrderResponse = {
  id: number;
  orderNumber: string;
  userId: number;
  saleAnnouncementId?: number;
  saleTitle?: string;
  saleType?: OrderType;
  orderType: OrderType;
  orderStatus: OrderStatus;
  productId: number;
  productType: ProductType;
  itemName: string;
  unitPrice: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  totalPrice: number;
  businessId?: number;
  importerId?: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserOrderSummaryResponse = {
  userId: number;
  orders: OrderResponse[];
  totalAmount: number;
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type OrderCancelRequest = {
  reason?: string;
};

export type OrderStatusUpdateRequest = {
  orderStatus: OrderStatus;
  reason?: string;
};

export type OrderApprovalRequest = {
  approvedQuantity: number;
};

// ============================================================================
// Sale Announcement Types
// ============================================================================

export type SaleStatus = "DRAFT" | "OPEN" | "CLOSED" | "SOLD_OUT";

export type SaleAnnouncementResponse = {
  id: number;
  title: string;
  productId: number;
  productType: ProductType;
  saleType: OrderType;
  saleStatus: SaleStatus;
  salePrice: number;
  totalQuantity: number;
  availableQuantity: number;
  maxOrderQuantity?: number;
  orderableRoles?: string[];
  saleStartAt: string;
  saleEndAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SaleAnnouncementCreateRequest = {
  title: string;
  itemName?: string;
  productId: number;
  productType: ProductType;
  saleType: OrderType;
  saleStatus?: SaleStatus;
  salePrice: number;
  totalQuantity: number;
  availableQuantity: number;
  maxOrderQuantity?: number;
  orderableRoles?: string[];
  saleStartAt: string;
  saleEndAt: string;
};

export type SaleAnnouncementUpdateRequest = Partial<
  Omit<SaleAnnouncementCreateRequest, "title">
> & {
  title?: string;
};

// ============================================================================
// Board Types
// ============================================================================

export type AnnouncementScope = "GLOBAL" | "BOARD";

export type BoardResponse = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

export type AnnouncementResponse = {
  id: number;
  title: string;
  content: string;
  scope: AnnouncementScope;
  boardId?: number;
  createdAt: string;
};

export type PostSearchType = "TITLE" | "CONTENT" | "AUTHOR";

export type PostResponse = {
  id: number;
  boardId: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostRequest = {
  title: string;
  content: string;
};

export type UpdatePostRequest = {
  title?: string;
  content?: string;
};

export type BoardRequest = {
  name: string;
  slug: string;
  description?: string;
};

export type AnnouncementRequest = {
  title: string;
  content: string;
  scope: AnnouncementScope;
  boardId?: number;
};

// ============================================================================
// Banner Types
// ============================================================================

export type BannerResponse = {
  id: number;
  title: string;
  description?: string;
  link?: string;
  mainUrl: string;
  backgroundUrl: string;
};

// ============================================================================
// Pre-register Types
// ============================================================================

export type PreRegisterRequest = {
  email: string;
  name: string;
  phoneNumber?: string;
  gender?: string;
  birthday?: string;
};

export type PreRegisterResponse = {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  gender?: string;
  birthday?: string;
  createdAt: string;
};

// ============================================================================
// S3 Types
// ============================================================================

export type PresignUrlResponse = {
  url: string;
};

// ============================================================================
// Nice ID Types
// ============================================================================

export type NiceIdVerificationStartRequest = {
  authType: string;
  returnUrl?: string;
  methodType?: string;
  popupYn?: string;
  closeUiType?: string;
  receivedData?: string;
};

export type NiceIdVerificationStartResponse = {
  formAction: string;
  tokenVersionId: string;
  encData: string;
  integrityValue: string;
  siteCode: string;
  requestNo: string;
  message?: string;
};

export type NiceIdDecryptedPayload = {
  resultcode: string;
  requestno: string;
  responseno: string;
  enctime: string;
  sitecode: string;
  name: string;
  utf8_name: string;
  birthdate: string;
  gender: string;
  nationalinfo: string;
  mobileco: string;
  mobileno: string;
  ci: string;
  di: string;
  authtype: string;
  businessno?: string;
  receivedata?: string;
};

export type NiceIdVerificationResultResponse = {
  status: string;
  raw: string;
  payload: NiceIdDecryptedPayload;
};

// ============================================================================
// API Functions
// ============================================================================

export const api = {
  // ==========================================================================
  // Auth
  // ==========================================================================
  signIn: (data: LoginRequest) =>
    http<AuthResponse>("/api/auth/login", { method: "POST", json: data }),

  signUp: (data: SignupRequest) =>
    http<AuthResponse>("/api/auth/signup", { method: "POST", json: data }),

  refreshToken: (refreshToken: string) =>
    http<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      json: { refreshToken },
    }),

  checkEmail: (email: string) =>
    http<AvailabilityResponse>("/api/auth/check-email", {
      method: "POST",
      json: { email },
    }),

  checkUsername: (username: string) =>
    http<AvailabilityResponse>("/api/auth/check-username", {
      method: "POST",
      json: { username },
    }),

  changePassword: (data: ChangePasswordRequest) =>
    http<boolean>("/api/auth/change-password", { method: "POST", json: data }),

  resetPassword: (email: string) =>
    http<ResetPasswordResponse>("/api/auth/reset-password", {
      method: "POST",
      json: { email },
    }),

  // Email Verification
  sendEmailVerification: (email: string) =>
    http<Record<string, string>>("/api/auth/email-verification/send", {
      method: "POST",
      json: { email },
    }),

  verifyEmailCode: (data: EmailVerificationVerifyRequest) =>
    http<Record<string, string>>("/api/auth/email-verification/verify", {
      method: "POST",
      json: data,
    }),

  sendResetEmailVerification: (email: string) =>
    http<Record<string, string>>("/api/auth/email-verification/reset/send", {
      method: "POST",
      json: { email },
    }),

  verifyResetEmailCode: (data: EmailVerificationVerifyRequest) =>
    http<Record<string, string>>("/api/auth/email-verification/reset/verify", {
      method: "POST",
      json: data,
    }),

  // ==========================================================================
  // User
  // ==========================================================================
  getMe: () => http<UserSelfResponse>("/api/users/me"),

  // Business
  applyBusiness: (data: UserBusinessApplicationRequest) =>
    http<UserBusinessApplicationResponse>(
      "/api/users/businesses/applications",
      {
        method: "POST",
        json: data,
      },
    ),

  getPickupLocations: () =>
    http<PickupLocationResponse[]>("/api/users/businesses/pickup-locations"),

  // ==========================================================================
  // Bottles
  // ==========================================================================
  getBottleParams: () =>
    http<BottleSearchParameterValues>("/api/bottles/parameters"),

  getBottles: (params?: BottleSearchParams) => {
    const { pageNumber = 0, pageSize = 15, ...rest } = params ?? {};
    return http<PageResponse<Bottle>>("/api/bottles", {
      params: { pageNumber, pageSize, ...rest },
    });
  },

  getBottleById: (id: number) => http<Bottle>(`/api/bottles/${id}`),

  // Bottle Reservations
  getReservationNotices: (params?: PageParams) =>
    http<PageResponse<BottleReservationNoticeResponse>>(
      "/api/bottles/reservations/notices",
      { params },
    ),

  getReservationNotice: (noticeId: number) =>
    http<BottleReservationNoticeResponse>(
      `/api/bottles/reservations/notices/${noticeId}`,
    ),

  createReservationApplication: (
    noticeId: number,
    data: BottleReservationApplicationRequest,
  ) =>
    http<BottleReservationApplicationResponse>(
      `/api/bottles/reservations/notices/${noticeId}/applications`,
      { method: "POST", json: data },
    ),

  getMyReservationApplications: (params?: PageParams) =>
    http<PageResponse<BottleReservationApplicationResponse>>(
      "/api/bottles/reservations/applications/me",
      { params },
    ),

  updateReservationApplication: (
    applicationId: number,
    data: BottleReservationApplicationRequest,
  ) =>
    http<BottleReservationApplicationResponse>(
      `/api/bottles/reservations/applications/${applicationId}`,
      { method: "PUT", json: data },
    ),

  cancelReservationApplication: (applicationId: number) =>
    http<boolean>(`/api/bottles/reservations/applications/${applicationId}`, {
      method: "DELETE",
    }),

  // ==========================================================================
  // Orders
  // ==========================================================================
  getOrders: (userId?: number) =>
    http<OrderResponse[]>("/api/orders", { params: userId ? { userId } : {} }),

  getOrder: (orderId: number) => http<OrderResponse>(`/api/orders/${orderId}`),

  createOrder: (data: OrderCreateRequest) =>
    http<OrderResponse>("/api/orders", { method: "POST", json: data }),

  cancelOrder: (orderId: number, data?: OrderCancelRequest) =>
    http<OrderResponse>(`/api/orders/${orderId}/cancel`, {
      method: "PATCH",
      json: data ?? {},
    }),

  // ==========================================================================
  // Sales
  // ==========================================================================
  getSales: (saleStatus?: SaleStatus) =>
    http<SaleAnnouncementResponse[]>("/api/sales", {
      params: saleStatus ? { saleStatus } : {},
    }),

  getSale: (saleId: number) =>
    http<SaleAnnouncementResponse>(`/api/sales/${saleId}`),

  // ==========================================================================
  // Boards
  // ==========================================================================
  getBoards: () => http<BoardResponse[]>("/api/boards"),

  getGlobalAnnouncements: () =>
    http<AnnouncementResponse[]>("/api/boards/announcements/global"),

  getBoardAnnouncements: (boardId: number) =>
    http<AnnouncementResponse[]>(`/api/boards/announcements/board/${boardId}`),

  getPosts: (
    boardId: number,
    params?: PageParams & { searchType?: PostSearchType; keyword?: string },
  ) =>
    http<PageResponse<PostResponse>>(`/api/boards/${boardId}/posts`, {
      params,
    }),

  createPost: (boardId: number, data: CreatePostRequest) =>
    http<PostResponse>(`/api/boards/${boardId}/posts`, {
      method: "POST",
      json: data,
    }),

  updatePost: (boardId: number, postId: number, data: UpdatePostRequest) =>
    http<PostResponse>(`/api/boards/${boardId}/posts/${postId}`, {
      method: "PUT",
      json: data,
    }),

  deletePost: (boardId: number, postId: number) =>
    http<boolean>(`/api/boards/${boardId}/posts/${postId}`, {
      method: "DELETE",
    }),

  // ==========================================================================
  // Banners
  // ==========================================================================
  getBanners: () => http<BannerResponse[]>("/api/banners"),

  getBanner: (id: number) => http<BannerResponse>(`/api/banners/${id}`),

  // ==========================================================================
  // Pre-register
  // ==========================================================================
  preRegister: (data: PreRegisterRequest) =>
    http<PreRegisterResponse>("/api/pre-register", {
      method: "POST",
      json: data,
    }),

  // ==========================================================================
  // S3
  // ==========================================================================
  getPresignedUrl: (key: string, filename?: string) =>
    http<PresignUrlResponse>("/api/s3/presigned", {
      params: { key, ...(filename && { filename }) },
    }),

  uploadFile: (file: FormData) =>
    http<Record<string, string>>("/api/s3/upload", {
      method: "POST",
      body: file,
    }),

  // ==========================================================================
  // Nice ID (본인인증)
  // ==========================================================================
  startNiceIdVerification: (data: NiceIdVerificationStartRequest) =>
    http<NiceIdVerificationStartResponse>("/api/user/niceid/verification", {
      method: "POST",
      json: data,
    }),

  getNiceIdResult: (tokenVersionId: string, encData: string) =>
    http<NiceIdVerificationResultResponse>("/api/user/niceid/result", {
      method: "POST",
      params: { token_version_id: tokenVersionId, enc_data: encData },
    }),
};

// ============================================================================
// Admin API
// ============================================================================

/** 서버 컴포넌트에서 인증 토큰을 전달하기 위한 옵션 */
export type AuthOptions = {
  token?: string;
};

export const adminApi = {
  // ==========================================================================
  // Users
  // ==========================================================================
  getUsers: (params?: AdminUserSearchParams, opts?: AuthOptions) =>
    http<PageResponse<AdminUserResponse>>("/api/admin/users", {
      params,
      token: opts?.token,
    }),

  getUser: (id: number, opts?: AuthOptions) =>
    http<AdminUserResponse>(`/api/admin/users/${id}`, { token: opts?.token }),

  deleteUser: (id: number, opts?: AuthOptions) =>
    http<boolean>(`/api/admin/users/${id}`, {
      method: "DELETE",
      token: opts?.token,
    }),

  updateUserStatus: (id: number, user: AdminUserResponse, opts?: AuthOptions) =>
    http<AdminUserResponse>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      json: user,
      token: opts?.token,
    }),

  addUserRoles: (id: number, roles: string[], opts?: AuthOptions) =>
    http<AdminUserResponse>(`/api/admin/users/${id}/roles/add`, {
      method: "PATCH",
      json: { roles },
      token: opts?.token,
    }),

  removeUserRoles: (id: number, roles: string[], opts?: AuthOptions) =>
    http<AdminUserResponse>(`/api/admin/users/${id}/roles/remove`, {
      method: "PATCH",
      json: { roles },
      token: opts?.token,
    }),
  banUser: (id: number, data: BlacklistRequest, opts?: AuthOptions) =>
    http<AdminUserResponse>(`/api/admin/users/${id}/ban`, {
      method: "PATCH",
      json: data,
      token: opts?.token,
    }),
  editUserBan: (id: number, data: BlacklistRequest, opts?: AuthOptions) =>
    http<AdminUserResponse>(`/api/admin/users/${id}/ban/update`, {
      method: "PATCH",
      json: data,
      token: opts?.token,
    }),
  /**
   * 사용자 제재 해제 (endAt을 현재 시간으로 설정)
   */
  cancelUserBan: (id: number, opts?: AuthOptions) => {
    return http<AdminUserResponse>(`/api/admin/users/${id}/ban/update`, {
      method: "PATCH",
      json: { endAt: "2000-01-01T00:00:00", reason: "제재 해제" },
      token: opts?.token,
    });
  },

  // ==========================================================================
  // Business
  // ==========================================================================
  getBusinessApplications: (params?: PageParams, opts?: AuthOptions) =>
    http<PageResponse<UserBusinessApplicationResponse>>(
      "/api/admin/businesses/applications",
      { params, token: opts?.token },
    ),

  getBusinessApplication: (applicationId: number, opts?: AuthOptions) =>
    http<UserBusinessApplicationResponse>(
      `/api/admin/businesses/applications/${applicationId}`,
      { token: opts?.token },
    ),

  approveBusinessApplication: (applicationId: number, opts?: AuthOptions) =>
    http<UserBusinessApplicationResponse>(
      `/api/admin/businesses/applications/${applicationId}/approve`,
      { method: "POST", token: opts?.token },
    ),

  rejectBusinessApplication: (
    applicationId: number,
    rejectReason: string,
    opts?: AuthOptions,
  ) =>
    http<UserBusinessApplicationResponse>(
      `/api/admin/businesses/applications/${applicationId}/reject`,
      { method: "POST", json: { rejectReason }, token: opts?.token },
    ),

  getBusinessUsers: (opts?: AuthOptions) =>
    http<AdminBusinessUserResponse[]>("/api/admin/businesses/members", {
      token: opts?.token,
    }),

  grantPickupRole: (userId: number, opts?: AuthOptions) =>
    http<AdminBusinessUserResponse>(
      `/api/admin/businesses/members/${userId}/pickup/grant`,
      { method: "POST", token: opts?.token },
    ),

  revokePickupRole: (userId: number, opts?: AuthOptions) =>
    http<AdminBusinessUserResponse>(
      `/api/admin/businesses/members/${userId}/pickup/revoke`,
      { method: "POST", token: opts?.token },
    ),

  // ==========================================================================
  // Bottles
  // ==========================================================================
  getAdminBottles: (params?: BottleSearchParams, opts?: AuthOptions) =>
    http<PageResponse<BottleAdminResponse>>("/api/admin/bottles", {
      params,
      token: opts?.token,
    }),

  getAdminBottle: (id: number, opts?: AuthOptions) =>
    http<BottleAdminResponse>(`/api/admin/bottles/${id}`, {
      token: opts?.token,
    }),

  createBottle: (data: FormData, opts?: AuthOptions) =>
    http<BottleAdminResponse>("/api/admin/bottles", {
      method: "POST",
      body: data,
      token: opts?.token,
    }),

  updateBottle: (id: number, data: FormData, opts?: AuthOptions) =>
    http<BottleAdminResponse>(`/api/admin/bottles/${id}`, {
      method: "PATCH",
      body: data,
      token: opts?.token,
    }),

  deleteBottle: (id: number, opts?: AuthOptions) =>
    http<boolean>(`/api/admin/bottles/${id}`, {
      method: "DELETE",
      token: opts?.token,
    }),

  // ==========================================================================
  // Bottle Reservations (Admin)
  // ==========================================================================
  getAdminReservationNotices: (params?: PageParams, opts?: AuthOptions) =>
    http<PageResponse<BottleReservationNoticeResponse>>(
      "/api/admin/bottles/reservations/notices",
      { params, token: opts?.token },
    ),

  getAdminReservationNotice: (noticeId: number, opts?: AuthOptions) =>
    http<BottleReservationNoticeResponse>(
      `/api/admin/bottles/reservations/notices/${noticeId}`,
      { token: opts?.token },
    ),

  createReservationNotice: (
    data: BottleReservationNoticeRequest,
    opts?: AuthOptions,
  ) =>
    http<BottleReservationNoticeResponse>(
      "/api/admin/bottles/reservations/notices",
      { method: "POST", json: data, token: opts?.token },
    ),

  updateReservationNotice: (
    noticeId: number,
    data: BottleReservationNoticeRequest,
    opts?: AuthOptions,
  ) =>
    http<BottleReservationNoticeResponse>(
      `/api/admin/bottles/reservations/notices/${noticeId}`,
      { method: "PUT", json: data, token: opts?.token },
    ),

  getAdminReservationApplications: (
    params?: PageParams & { userId?: number; noticeId?: number },
    opts?: AuthOptions,
  ) =>
    http<PageResponse<BottleReservationApplicationResponse>>(
      "/api/admin/bottles/reservations/applications",
      { params, token: opts?.token },
    ),

  getAdminReservationApplication: (applicationId: number, opts?: AuthOptions) =>
    http<BottleReservationApplicationResponse>(
      `/api/admin/bottles/reservations/applications/${applicationId}`,
      { token: opts?.token },
    ),

  confirmReservationApplication: (
    applicationId: number,
    confirmedQuantity: number,
    opts?: AuthOptions,
  ) =>
    http<BottleReservationApplicationResponse>(
      `/api/admin/bottles/reservations/applications/${applicationId}/confirm`,
      { method: "POST", json: { confirmedQuantity }, token: opts?.token },
    ),

  rejectReservationApplication: (applicationId: number, opts?: AuthOptions) =>
    http<BottleReservationApplicationResponse>(
      `/api/admin/bottles/reservations/applications/${applicationId}/reject`,
      { method: "POST", token: opts?.token },
    ),

  cancelReservationApplicationAdmin: (
    applicationId: number,
    opts?: AuthOptions,
  ) =>
    http<BottleReservationApplicationResponse>(
      `/api/admin/bottles/reservations/applications/${applicationId}/cancel`,
      { method: "POST", token: opts?.token },
    ),

  // ==========================================================================
  // Orders (Admin)
  // ==========================================================================
  getAdminOrders: (
    params?: {
      orderType?: OrderType;
      orderStatus?: OrderStatus;
    },
    opts?: AuthOptions,
  ) =>
    http<OrderResponse[]>("/api/admin/orders", { params, token: opts?.token }),

  approveOrder: (
    orderId: number,
    data: OrderApprovalRequest,
    opts?: AuthOptions,
  ) =>
    http<OrderResponse>(`/api/admin/orders/${orderId}/approve`, {
      method: "PATCH",
      json: data,
      token: opts?.token,
    }),

  updateOrderStatus: (
    orderId: number,
    data: OrderStatusUpdateRequest,
    opts?: AuthOptions,
  ) =>
    http<OrderResponse>(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      json: data,
      token: opts?.token,
    }),

  getUserOrders: (
    userId: number,
    params?: { page?: number; size?: number; sort?: string[] },
    opts?: AuthOptions,
  ) =>
    http<AdminUserOrderSummaryResponse>(`/api/admin/orders/users/${userId}`, {
      params,
      token: opts?.token,
    }),

  // ==========================================================================
  // Sales (Admin)
  // ==========================================================================
  createSale: (data: SaleAnnouncementCreateRequest, opts?: AuthOptions) =>
    http<SaleAnnouncementResponse>("/api/admin/sales", {
      method: "POST",
      json: data,
      token: opts?.token,
    }),

  updateSale: (
    saleId: number,
    data: SaleAnnouncementUpdateRequest,
    opts?: AuthOptions,
  ) =>
    http<SaleAnnouncementResponse>(`/api/admin/sales/${saleId}`, {
      method: "PATCH",
      json: data,
      token: opts?.token,
    }),

  // ==========================================================================
  // Boards (Admin)
  // ==========================================================================
  createBoard: (data: BoardRequest, opts?: AuthOptions) =>
    http<BoardResponse>("/api/admin/boards", {
      method: "POST",
      json: data,
      token: opts?.token,
    }),

  createAnnouncement: (data: AnnouncementRequest, opts?: AuthOptions) =>
    http<AnnouncementResponse>("/api/admin/boards/announcements", {
      method: "POST",
      json: data,
      token: opts?.token,
    }),

  deletePostAdmin: (boardId: number, postId: number, opts?: AuthOptions) =>
    http<boolean>(`/api/admin/boards/${boardId}/posts/${postId}`, {
      method: "DELETE",
      token: opts?.token,
    }),

  // ==========================================================================
  // Banners (Admin)
  // ==========================================================================
  createBanner: (data: FormData, opts?: AuthOptions) =>
    http<BannerResponse>("/api/banners", {
      method: "POST",
      body: data,
      token: opts?.token,
    }),

  updateBanner: (id: number, data: FormData, opts?: AuthOptions) =>
    http<BannerResponse>(`/api/banners/${id}`, {
      method: "PATCH",
      body: data,
      token: opts?.token,
    }),
};
