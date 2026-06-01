import { describe, expect, it, vi } from "vitest";
import {
  buildGeneralItemSaleDetailHref,
  collectGeneralItemProductIds,
  fetchOpenGeneralItemSalesPage,
  getGeneralItemOrderQuantityLimit,
  normalizeGeneralItemOrderQuantity,
} from "./general-item-sales";

describe("public general item sales", () => {
  it("collects open ITEM GENERAL sales across source pages", async () => {
    const firstSale = {
      id: 10,
      productType: "ITEM",
      saleType: "GENERAL",
      saleStatus: "OPEN",
      itemName: "배송 패키지 A",
    } as const;
    const secondSale = {
      id: 11,
      productType: "ITEM",
      saleType: "GENERAL",
      saleStatus: "OPEN",
      itemName: "배송 패키지 B",
    } as const;
    const fetchSales = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          content: [
            { id: 1, productType: "BOTTLE", saleType: "GENERAL", saleStatus: "OPEN" },
            { id: 2, productType: "ITEM", saleType: "RESERVATION", saleStatus: "OPEN" },
          ],
          last: false,
          page: { totalPages: 2 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          content: [firstSale, secondSale],
          last: true,
          page: { totalPages: 2 },
        },
      });

    const result = await fetchOpenGeneralItemSalesPage({
      fetchSales,
      page: 1,
      size: 20,
    });

    expect(result).toEqual({
      sales: [firstSale, secondSale],
      totalElements: 2,
    });
    expect(fetchSales).toHaveBeenCalledWith({
      page: 0,
      size: 100,
      sort: ["createdAt,desc"],
      saleStatus: "OPEN",
    });
  });

  it("builds a sale detail href from a sale announcement", () => {
    expect(buildGeneralItemSaleDetailHref({ id: 10 })).toBe("/general-items/10");
    expect(buildGeneralItemSaleDetailHref({ id: undefined })).toBe("/general-items");
  });

  it("uses the smaller stock or per-order quantity as the order quantity limit", () => {
    expect(getGeneralItemOrderQuantityLimit({ availableQuantity: 8, maxOrderQuantity: 3 })).toBe(3);
    expect(getGeneralItemOrderQuantityLimit({ availableQuantity: 2, maxOrderQuantity: 5 })).toBe(2);
    expect(getGeneralItemOrderQuantityLimit({ availableQuantity: 4, maxOrderQuantity: undefined })).toBe(4);
    expect(getGeneralItemOrderQuantityLimit({ availableQuantity: 0, maxOrderQuantity: 3 })).toBe(0);
  });

  it("normalizes selected order quantity inside the available range", () => {
    expect(normalizeGeneralItemOrderQuantity(3, 5)).toBe(3);
    expect(normalizeGeneralItemOrderQuantity(0, 5)).toBe(1);
    expect(normalizeGeneralItemOrderQuantity(9, 5)).toBe(5);
    expect(normalizeGeneralItemOrderQuantity(Number.NaN, 5)).toBe(1);
    expect(normalizeGeneralItemOrderQuantity(1, 0)).toBe(1);
  });

  it("collects unique product ids for sale image lookup", () => {
    expect(
      collectGeneralItemProductIds([{ productId: 10 }, { productId: 10 }, { productId: 11 }, { productId: undefined }]),
    ).toEqual([10, 11]);
  });
});
