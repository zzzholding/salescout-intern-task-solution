
import { describe, it, expect } from "vitest";
import { calculatePrice } from "./pricing";
import type { Product } from "./types";

describe("calculatePrice", () => {
  it("undercuts the cheapest available competitor", () => {
    const product: Product = {
      sku: "IPHONE",
      name: "iPhone",
      myPrice: 389990,
      minPrice: 370000,
      maxPrice: 420000,
      step: 10,
      competitors: [
        { seller: "A", price: 384990, inStock: true },
        { seller: "B", price: 379990, inStock: false },
        { seller: "C", price: 386500, inStock: true },
      ],
    };

    expect(calculatePrice(product)).toEqual({
      sku: "IPHONE",
      oldPrice: 389990,
      newPrice: 384980,
      reason: "UNDERCUT",
    });
  });

  it("does not go below minPrice", () => {
    const product: Product = {
      sku: "SAMSUNG",
      name: "Samsung",
      myPrice: 189000,
      minPrice: 180000,
      maxPrice: 210000,
      step: 100,
      competitors: [
        { seller: "A", price: 175000, inStock: true },
      ],
    };

    expect(calculatePrice(product).newPrice).toBe(180000);
    expect(calculatePrice(product).reason).toBe("AT_MIN");
  });

  it("uses maxPrice when no competitors are in stock", () => {
    const product: Product = {
      sku: "XIAOMI",
      name: "Xiaomi",
      myPrice: 89990,
      minPrice: 80000,
      maxPrice: 99990,
      step: 50,
      competitors: [
        { seller: "A", price: 85000, inStock: false },
      ],
    };

    expect(calculatePrice(product).newPrice).toBe(99990);
    expect(calculatePrice(product).reason).toBe("NO_COMPETITORS");
  });

  it("does not exceed maxPrice", () => {
    const product: Product = {
      sku: "AIRPODS",
      name: "AirPods",
      myPrice: 119990,
      minPrice: 100000,
      maxPrice: 125000,
      step: 1,
      competitors: [
        { seller: "A", price: 150000, inStock: true },
      ],
    };

    expect(calculatePrice(product).newPrice).toBe(125000);
    expect(calculatePrice(product).reason).toBe("AT_MAX");
  });

  it("rounds down fractional prices", () => {
    const product: Product = {
      sku: "DYSON",
      name: "Dyson",
      myPrice: 359000,
      minPrice: 330000,
      maxPrice: 380000,
      step: 0.5,
      competitors: [
        { seller: "A", price: 349999.9, inStock: true },
      ],
    };

    expect(calculatePrice(product).newPrice).toBe(349999);
  });

  it("uses maxPrice for an empty competitor list", () => {
    const product: Product = {
      sku: "JBL",
      name: "JBL",
      myPrice: 54990,
      minPrice: 45000,
      maxPrice: 60000,
      step: 10,
      competitors: [],
    };

    expect(calculatePrice(product)).toEqual({
      sku: "JBL",
      oldPrice: 54990,
      newPrice: 60000,
      reason: "NO_COMPETITORS",
    });
  });
});
