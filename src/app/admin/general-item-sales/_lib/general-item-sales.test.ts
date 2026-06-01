import { describe, expect, it, vi } from "vitest";
import { fetchGeneralItemSalesPage } from "./general-item-sales";

describe("fetchGeneralItemSalesPage", () => {
  it("collects ITEM GENERAL sales across source pages before paginating", async () => {
    const firstGeneralSale = {
      id: 3,
      productType: "ITEM",
      saleType: "GENERAL",
      itemName: "배송 패키지 A",
    } as const;
    const secondGeneralSale = {
      id: 4,
      productType: "ITEM",
      saleType: "GENERAL",
      itemName: "배송 패키지 B",
    } as const;

    const fetchSales = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          content: [
            { id: 1, productType: "BOTTLE", saleType: "GENERAL" },
            { id: 2, productType: "ITEM", saleType: "RESERVATION" },
          ],
          last: false,
          page: { totalPages: 2 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          content: [firstGeneralSale, secondGeneralSale],
          last: true,
          page: { totalPages: 2 },
        },
      });

    const result = await fetchGeneralItemSalesPage({
      fetchSales,
      page: 1,
      size: 20,
      saleStatus: "OPEN",
    });

    expect(result).toEqual({
      sales: [firstGeneralSale, secondGeneralSale],
      totalElements: 2,
    });
    expect(fetchSales).toHaveBeenCalledTimes(2);
  });

  it("returns the requested page from filtered general item sales", async () => {
    const fetchSales = vi.fn().mockResolvedValueOnce({
      data: {
        content: [
          { id: 1, productType: "ITEM", saleType: "GENERAL" },
          { id: 2, productType: "ITEM", saleType: "GENERAL" },
          { id: 3, productType: "ITEM", saleType: "GENERAL" },
        ],
        last: true,
        page: { totalPages: 1 },
      },
    });

    const result = await fetchGeneralItemSalesPage({
      fetchSales,
      page: 2,
      size: 2,
    });

    expect(result).toEqual({
      sales: [{ id: 3, productType: "ITEM", saleType: "GENERAL" }],
      totalElements: 3,
    });
  });
});
