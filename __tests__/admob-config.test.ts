import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Platform
vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

describe("AdMob Configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should export correct production banner ad ID", async () => {
    // @ts-ignore - __DEV__ is a global
    (globalThis as any).__DEV__ = false;
    const config = await import("../lib/admob-config");
    expect(config.ADMOB_BANNER_ID).toBe("ca-app-pub-7262624140219679/2579173908");
  });

  it("should export correct production interstitial ad ID", async () => {
    // @ts-ignore
    (globalThis as any).__DEV__ = false;
    const config = await import("../lib/admob-config");
    expect(config.ADMOB_INTERSTITIAL_ID).toBe("ca-app-pub-7262624140219679/6326847221");
  });

  it("should export test banner ID in dev mode", async () => {
    // @ts-ignore
    (globalThis as any).__DEV__ = true;
    const config = await import("../lib/admob-config");
    expect(config.ADMOB_BANNER_ID).toBe("ca-app-pub-3940256099942544/9214589741");
  });

  it("should export test interstitial ID in dev mode", async () => {
    // @ts-ignore
    (globalThis as any).__DEV__ = true;
    const config = await import("../lib/admob-config");
    expect(config.ADMOB_INTERSTITIAL_ID).toBe("ca-app-pub-3940256099942544/1033173712");
  });

  it("should correctly identify native platform", async () => {
    const config = await import("../lib/admob-config");
    expect(config.IS_NATIVE).toBe(true);
  });
});

describe("AdMob App Config Plugin", () => {
  it("should have AdMob plugin configured in app.config.ts", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const configContent = fs.readFileSync(
      path.resolve(__dirname, "../app.config.ts"),
      "utf-8"
    );
    
    // Verify the plugin is configured with correct app IDs
    expect(configContent).toContain("react-native-google-mobile-ads");
    expect(configContent).toContain("ca-app-pub-7262624140219679~2581809809");
  });
});

describe("AdMob Web Stub", () => {
  it("should export all required AdMob types", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    
    expect(stub.BannerAd).toBeDefined();
    expect(stub.BannerAdSize).toBeDefined();
    expect(stub.BannerAdSize.ANCHORED_ADAPTIVE_BANNER).toBe("ANCHORED_ADAPTIVE_BANNER");
    expect(stub.InterstitialAd).toBeDefined();
    expect(stub.InterstitialAd.createForAdRequest).toBeDefined();
    expect(stub.AdEventType).toBeDefined();
    expect(stub.AdEventType.LOADED).toBe("loaded");
    expect(stub.AdEventType.CLOSED).toBe("closed");
    expect(stub.AdEventType.ERROR).toBe("error");
    expect(stub.TestIds).toBeDefined();
  });

  it("should return a functional interstitial mock", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    const interstitial = (stub.InterstitialAd.createForAdRequest as any)("test-id");
    
    expect(interstitial.addAdEventListener).toBeDefined();
    expect(interstitial.load).toBeDefined();
    expect(interstitial.show).toBeDefined();
    
    // Should not throw
    const unsub = (interstitial.addAdEventListener as any)("loaded", () => {});
    expect(typeof unsub).toBe("function");
    interstitial.load();
    interstitial.show();
  });
});
