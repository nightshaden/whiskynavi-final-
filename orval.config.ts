import { defineConfig } from "orval";

/**
 * 백엔드 OpenAPI 스펙의 operationId가 불규칙한 경우를 보정하는 매핑.
 * key: 원본 operationId (OpenAPI 스펙), value: 원하는 함수명
 */
const operationNameMap: Record<string, string> = {
  // --- Admin Bottles ---
  list_1: "listAdminBottles", // GET /api/admin/bottles
  create_3: "createAdminBottle", // POST /api/admin/bottles
  get_1: "getAdminBottle", // GET /api/admin/bottles/{id}
  patch_1: "updateAdminBottle", // PATCH /api/admin/bottles/{id}
  delete: "deleteAdminBottle", // DELETE /api/admin/bottles/{id}

  // --- Admin Bottle Reservations ---
  listApplications_1: "listAdminReservationApplications", // GET /api/admin/bottles/reservations/applications
  getApplication_1: "getAdminReservationApplication", // GET /api/admin/bottles/reservations/applications/{id}
  cancelApplication_1: "cancelAdminReservationApplication", // POST .../cancel
  rejectApplication_1: "rejectAdminReservationApplication", // POST .../reject

  // --- Admin Orders ---
  listOrders_1: "listAdminOrders", // GET /api/admin/orders
  updateStatus_1: "updateAdminOrderStatus", // PATCH /api/admin/orders/{id}/status

  // --- Admin Sales ---
  create_2: "createAdminSale", // POST /api/admin/sales
  update: "updateAdminSale", // PATCH /api/admin/sales/{saleId}

  // --- Admin Users ---
  updateStatus: "updateAdminUserStatus", // PATCH /api/admin/users/{id}/status

  // --- Public Bottles ---
  list_3: "listBottles", // GET /api/bottles
  get_3: "getBottle", // GET /api/bottles/{id}

  // --- Public Sales ---
  list_2: "listSales", // GET /api/sales
  get_2: "getSale", // GET /api/sales/{saleId}

  // --- Public Banners ---
  list: "listBanners", // GET /api/banners
  create_1: "createBanner", // POST /api/banners
  get: "getBanner", // GET /api/banners/{id}
  patch: "updateBanner", // PATCH /api/banners/{id}

  // --- Public Reservation Notices ---
  listNotices_1: "listReservationNotices", // GET /api/bottles/reservations/notices
  getNotice_1: "getReservationNotice", // GET /api/bottles/reservations/notices/{id}

  // --- Auth ---
  refreshToken_1: "refreshAuthToken", // POST /api/auth/refresh

  // --- Pre-register ---
  create: "createPreRegister", // POST /api/pre-register
};

export default defineConfig({
  whiskynavi: {
    input: {
      target: "https://api.whiskynavi.com/v3/api-docs",
    },
    output: {
      target: "./src/apis/generated/api.ts",
      mode: "single",
      client: "fetch",
      baseUrl: "",
      override: {
        mutator: {
          path: "./src/apis/mutator.ts",
          name: "customFetch",
        },
        operationName: (operation) => {
          const id = operation.operationId;
          if (id && id in operationNameMap) {
            return operationNameMap[id];
          }
          return id ?? "unknown";
        },
      },
    },
  },
});
