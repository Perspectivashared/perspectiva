import {
  COIN_BUNDLES,
  POINTS_TO_COINS_RATE,
  convertCoinsToPoints,
  convertPointsToCoins,
  getTotalCoinsForBundle,
} from "@/features/pricing/domain/pricing-data";

describe("pricing utilities", () => {
  it("converts points to coins and back", () => {
    const points = 12;
    const coins = convertPointsToCoins(points);

    expect(coins).toBe(points * POINTS_TO_COINS_RATE);
    expect(convertCoinsToPoints(coins)).toBe(points);
  });

  it("computes bundle totals with bonus", () => {
    const bundle = COIN_BUNDLES.find((item) => item.id === "pro");

    expect(bundle).toBeDefined();
    expect(getTotalCoinsForBundle(bundle!)).toBe(bundle!.coins + (bundle!.bonusCoins ?? 0));
    expect(getTotalCoinsForBundle(bundle!)).toBe(800); // 750 + 50 bonus
  });

  it("bundles without a bonus total their base coins", () => {
    const bundle = COIN_BUNDLES.find((item) => item.id === "starter");

    expect(bundle).toBeDefined();
    expect(getTotalCoinsForBundle(bundle!)).toBe(bundle!.coins);
  });
});
