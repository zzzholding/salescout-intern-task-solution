
import type { Product, PriceResult } from "./types";

export function calculatePrice(product: Product): PriceResult {
  const availableCompetitors = product.competitors.filter(
    (competitor) => competitor.inStock
  );

  if (availableCompetitors.length === 0) {
    return {
      sku: product.sku,
      oldPrice: product.myPrice,
      newPrice: product.maxPrice,
      reason: "NO_COMPETITORS",
    };
  }

  const best = Math.min(
    ...availableCompetitors.map((competitor) => competitor.price)
  );

  const candidate = Math.floor(best - product.step);

  if (candidate < product.minPrice) {
    return {
      sku: product.sku,
      oldPrice: product.myPrice,
      newPrice: product.minPrice,
      reason: "AT_MIN",
    };
  }

  if (candidate > product.maxPrice) {
    return {
      sku: product.sku,
      oldPrice: product.myPrice,
      newPrice: product.maxPrice,
      reason: "AT_MAX",
    };
  }

  return {
    sku: product.sku,
    oldPrice: product.myPrice,
    newPrice: candidate,
    reason: "UNDERCUT",
  };
}
