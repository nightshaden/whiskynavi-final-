import { describe, expect, it } from "vitest";
import { NAV_LINKS } from "./constants";

describe("NAV_LINKS", () => {
  it("does not expose guest order lookup as a primary navigation entry", () => {
    expect(NAV_LINKS).not.toContainEqual({ href: "/orders/guest", label: "주문조회" });
  });
});
