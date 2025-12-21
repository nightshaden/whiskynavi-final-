import { http } from "./index";

export type User = { id: number; name: string };

export type BottleParams = {
  names: string[];
  companies: string[];
  brands: string[];
  series: string[];
  maltTypes: string[];
  distilleries: string[];
  caskTypes: string[];
};

export type BottleQueries = Partial<{
  vintageTo: number;
  brand: string;
  bottledDateTo: string;
  distillery: string;
  distillationDateFrom: string;
  name: string;
  abvTo: number;
  pageSize: number;
  vintageFrom: number;
  caskType: string;
  bottledDateFrom: string;
  maltType: string;
  series: string;
  page: number;
  distillationDateTo: string;
  company: string;
  abvFrom: number;
}>;

export type Bottle = {
  id: number;
  name: string;
  company: string;
  brand: string;
  series: string;
  imgUrl: string | null;
  extraInfos: Record<string, unknown>;
  maltType: string;
  distillery: string;
  distillationDate: string;
  bottledDate: string;
  caskType: string;
  caskNumber: string;
  abv: number;
  capacity: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

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

export type BottleResponse = {
  content: Bottle[];
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

export const api = {
  getMe: () => http<User>("/me"),
  getBottleParams: () => http<BottleParams>("/api/bottles/parameters"),
  getBottles: (queries?: BottleQueries) => {
    // URL의 'page'를 API의 'pageNumber'로 변환
    const { page, ...rest } = queries ?? {};
    const params = { pageSize: 15, ...rest, pageNumber: page };
    return http<BottleResponse>("/api/bottles", { params });
  },
  // // ✅ GET: 본문 금지, params OK
  // getUsers: (params?: { role?: string }) => http<User[]>("/users", { params }),

  // // ✅ GET by id
  // getUserById: (id: number) => http<User>(`/users/${id}`),

  // // ✅ POST JSON: json과 body는 oneOf라 동시에 불가
  // createUser: (data: { name: string }) =>
  //   http<User>("/users", { method: "POST", json: data }),

  // // ✅ 파일 업로드: body(FormData) 사용
  // uploadAvatar: (id: number, form: FormData) =>
  //   http<{ ok: true }>(`/users/${id}/avatar`, { method: "POST", body: form }),

  // // ✅ PATCH JSON
  // updateUserName: (id: number, data: { name: string }) =>
  //   http<User>(`/users/${id}`, { method: "PATCH", json: data }),
};
