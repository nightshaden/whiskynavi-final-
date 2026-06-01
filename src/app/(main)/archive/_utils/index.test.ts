import { describe, expect, it } from "vitest";
import { buildQueryString } from ".";

describe("archive query helpers", () => {
  it("필터 변경 시 URL 페이지를 1페이지로 되돌린다", () => {
    expect(buildQueryString({ keyword: "springbank" })).toBe("keyword=springbank&page=1");
  });
});
