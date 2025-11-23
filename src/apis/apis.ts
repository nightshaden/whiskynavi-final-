import { http } from "./index";

export type User = { id: number; name: string };

export const api = {
  getMe: () => http<User>("/me"),
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
