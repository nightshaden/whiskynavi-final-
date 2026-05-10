import { describe, expect, it } from "vitest";
import {
  buildAdminUserRoleFilterParams,
  getAdminUserRoleFilterValue,
  isAdminUserRoleFilterKey,
  normalizeAdminUsersSearchParams,
  resolveAdminUsersRoleFilters,
} from "./filters";

describe("admin users canonical role filters", () => {
  it("normalizes repeated excludedRoles query values", () => {
    expect(
      normalizeAdminUsersSearchParams({
        page: ["3", "4"],
        q: ["hong"],
        role: ["ROLE_USER"],
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      }),
    ).toMatchObject({
      page: "3",
      q: "hong",
      role: "ROLE_USER",
      excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
    });
  });

  it("passes canonical role and excludedRoles to API filters", () => {
    expect(
      resolveAdminUsersRoleFilters({
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      }),
    ).toEqual({
      role: "ROLE_USER",
      excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
    });
  });

  it("drops excludedRoles that conflict with the included role", () => {
    expect(
      resolveAdminUsersRoleFilters({
        role: "ROLE_WHISKYNAVI_MEMBER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      }),
    ).toEqual({
      role: "ROLE_WHISKYNAVI_MEMBER",
      excludedRoles: ["ROLE_WHISKYTALES_MEMBER"],
    });
  });

  it("derives navi and tales filter values from canonical query", () => {
    expect(getAdminUserRoleFilterValue({ role: "ROLE_WHISKYNAVI_MEMBER" }, "navi")).toBe("include");
    expect(
      getAdminUserRoleFilterValue({ excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"] }, "navi"),
    ).toBe("exclude");
    expect(getAdminUserRoleFilterValue({ excludedRoles: ["ROLE_WHISKYTALES_MEMBER"] }, "tales")).toBe("exclude");
    expect(getAdminUserRoleFilterValue({ role: "ROLE_USER" }, "tales")).toBe("all");
  });

  it("derives member type and business filter values from canonical role", () => {
    expect(getAdminUserRoleFilterValue({ role: "ROLE_USER" }, "role")).toBe("ROLE_USER");
    expect(getAdminUserRoleFilterValue({ role: "ROLE_PICK_UP_BUSINESS" }, "business")).toBe("ROLE_PICK_UP_BUSINESS");
    expect(getAdminUserRoleFilterValue({ role: "ROLE_PICK_UP_BUSINESS" }, "role")).toBe("all");
  });

  it("selects navi include by setting role and clearing the same excludedRole", () => {
    const params = buildAdminUserRoleFilterParams(
      {
        page: "5",
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      },
      "navi",
      "include",
    );

    expect(params.toString()).toBe("page=1&role=ROLE_WHISKYNAVI_MEMBER&excludedRoles=ROLE_WHISKYTALES_MEMBER");
  });

  it("selects navi exclude by appending excludedRoles without removing unrelated role", () => {
    const params = buildAdminUserRoleFilterParams(
      {
        page: "5",
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYTALES_MEMBER"],
      },
      "navi",
      "exclude",
    );

    expect(params.toString()).toBe(
      "page=1&role=ROLE_USER&excludedRoles=ROLE_WHISKYTALES_MEMBER&excludedRoles=ROLE_WHISKYNAVI_MEMBER",
    );
  });

  it("clears navi filter by removing matching role or excludedRole", () => {
    expect(
      buildAdminUserRoleFilterParams(
        {
          page: "5",
          role: "ROLE_WHISKYNAVI_MEMBER",
          excludedRoles: ["ROLE_WHISKYTALES_MEMBER"],
        },
        "navi",
        "all",
      ).toString(),
    ).toBe("page=1&excludedRoles=ROLE_WHISKYTALES_MEMBER");

    expect(
      buildAdminUserRoleFilterParams(
        {
          page: "5",
          role: "ROLE_USER",
          excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
        },
        "navi",
        "all",
      ).toString(),
    ).toBe("page=1&role=ROLE_USER&excludedRoles=ROLE_WHISKYTALES_MEMBER");
  });

  it("selects a business role through the same canonical role query", () => {
    const params = buildAdminUserRoleFilterParams(
      {
        page: "5",
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER"],
      },
      "business",
      "ROLE_PICK_UP_BUSINESS",
    );

    expect(params.toString()).toBe("page=1&role=ROLE_PICK_UP_BUSINESS&excludedRoles=ROLE_WHISKYNAVI_MEMBER");
  });

  it("recognizes only supported UI role filter keys", () => {
    expect(isAdminUserRoleFilterKey("role")).toBe(true);
    expect(isAdminUserRoleFilterKey("navi")).toBe(true);
    expect(isAdminUserRoleFilterKey("tales")).toBe(true);
    expect(isAdminUserRoleFilterKey("business")).toBe(true);
    expect(isAdminUserRoleFilterKey("status")).toBe(false);
  });
});
