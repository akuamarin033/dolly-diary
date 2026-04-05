import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Platform
vi.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

describe("Consent Context", () => {
  it("should export ConsentProvider and useConsent", async () => {
    const mod = await import("../lib/consent-context");
    expect(mod.ConsentProvider).toBeDefined();
    expect(mod.useConsent).toBeDefined();
  });
});

describe("AdMob Stub - AdsConsent", () => {
  it("should export AdsConsent with all required methods", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    expect(stub.AdsConsent).toBeDefined();
    expect(stub.AdsConsent.requestInfoUpdate).toBeDefined();
    expect(stub.AdsConsent.loadAndShowConsentFormIfRequired).toBeDefined();
    expect(stub.AdsConsent.gatherConsent).toBeDefined();
    expect(stub.AdsConsent.getConsentInfo).toBeDefined();
    expect(stub.AdsConsent.getUserChoices).toBeDefined();
    expect(stub.AdsConsent.getGdprApplies).toBeDefined();
    expect(stub.AdsConsent.getPurposeConsents).toBeDefined();
    expect(stub.AdsConsent.showForm).toBeDefined();
    expect(stub.AdsConsent.showPrivacyOptionsForm).toBeDefined();
    expect(stub.AdsConsent.reset).toBeDefined();
  });

  it("should return correct default consent info", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    const info = await stub.AdsConsent.getConsentInfo();
    expect(info.status).toBe("NOT_REQUIRED");
    expect(info.canRequestAds).toBe(true);
    expect(info.isConsentFormAvailable).toBe(false);
  });

  it("should return correct gatherConsent result", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    const result = await stub.AdsConsent.gatherConsent();
    expect(result.status).toBe("NOT_REQUIRED");
    expect(result.canRequestAds).toBe(true);
  });

  it("should return false for gdprApplies on web", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    const applies = await stub.AdsConsent.getGdprApplies();
    expect(applies).toBe(false);
  });

  it("should return all user choice fields", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    const choices = await stub.AdsConsent.getUserChoices();
    expect(choices.storeAndAccessInformationOnDevice).toBe(true);
    expect(choices.selectBasicAds).toBe(true);
    expect(choices.selectPersonalisedAds).toBe(true);
    expect(choices.measureAdPerformance).toBe(true);
  });
});

describe("AdMob Stub - AdsConsentStatus", () => {
  it("should export all consent status values", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    expect(stub.AdsConsentStatus.UNKNOWN).toBe("UNKNOWN");
    expect(stub.AdsConsentStatus.REQUIRED).toBe("REQUIRED");
    expect(stub.AdsConsentStatus.NOT_REQUIRED).toBe("NOT_REQUIRED");
    expect(stub.AdsConsentStatus.OBTAINED).toBe("OBTAINED");
  });
});

describe("AdMob Stub - AdsConsentDebugGeography", () => {
  it("should export debug geography values", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    expect(stub.AdsConsentDebugGeography.DISABLED).toBe(0);
    expect(stub.AdsConsentDebugGeography.EEA).toBe(1);
    expect(stub.AdsConsentDebugGeography.NOT_EEA).toBe(2);
  });
});

describe("AdMob Stub - mobileAds default export", () => {
  it("should export mobileAds as default with initialize method", async () => {
    const stub = await import("../lib/admob-stub.web.js");
    const ads = stub.default();
    expect(ads.initialize).toBeDefined();
    expect(ads.setRequestConfiguration).toBeDefined();
    expect(ads.openAdInspector).toBeDefined();
    // Should not throw
    await ads.initialize();
  });
});

describe("App Config - AdMob Plugin", () => {
  it("should have delay_app_measurement_init set to true", async () => {
    const fs = await import("fs");
    const configContent = fs.readFileSync("app.config.ts", "utf-8");
    expect(configContent).toContain("delay_app_measurement_init: true");
  });

  it("should have user_tracking_usage_description set", async () => {
    const fs = await import("fs");
    const configContent = fs.readFileSync("app.config.ts", "utf-8");
    expect(configContent).toContain("user_tracking_usage_description");
  });
});

describe("I18n - Privacy Settings translations", () => {
  it("should have privacy settings translation keys", async () => {
    const fs = await import("fs");
    const i18nContent = fs.readFileSync("lib/i18n.tsx", "utf-8");
    expect(i18nContent).toContain("profile.privacySettings");
    expect(i18nContent).toContain("profile.privacySettingsDesc");
  });
});

describe("Mediation Guide", () => {
  it("should have mediation guide document", async () => {
    const fs = await import("fs");
    const guideExists = fs.existsSync("docs/ADMOB_MEDIATION_GUIDE.md");
    expect(guideExists).toBe(true);
  });

  it("should contain correct AdMob IDs in guide", async () => {
    const fs = await import("fs");
    const guideContent = fs.readFileSync("docs/ADMOB_MEDIATION_GUIDE.md", "utf-8");
    expect(guideContent).toContain("ca-app-pub-7262624140219679~2581809809");
    expect(guideContent).toContain("ca-app-pub-7262624140219679/2579173908");
    expect(guideContent).toContain("ca-app-pub-7262624140219679/6326847221");
  });
});
