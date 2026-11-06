import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases from "react-native-purchases";

import { premiumService } from "../premium.service";

const mockedPurchases = jest.mocked(Purchases);

describe("premiumService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("reports free status when RevenueCat has no active entitlement", async () => {
    await expect(premiumService.initialize()).resolves.toEqual({
      isPremium: false,
      expirationDate: null,
      productId: null,
    });
    expect(mockedPurchases.configure).toHaveBeenCalledTimes(1);
  });

  it("unlocks premium from the active entitlement and caches it", async () => {
    mockedPurchases.getCustomerInfo.mockResolvedValueOnce({
      entitlements: {
        active: {
          premium: {
            expirationDate: null,
            productIdentifier: "signal_sense_premium",
          },
        },
      },
    } as never);

    await expect(premiumService.checkStatus()).resolves.toEqual({
      isPremium: true,
      expirationDate: null,
      productId: "signal_sense_premium",
    });
    expect(
      await AsyncStorage.getItem("@signalsense:premium_status"),
    ).toContain('"isPremium":true');
  });

  it("falls back to the cached status when RevenueCat fails", async () => {
    await AsyncStorage.setItem(
      "@signalsense:premium_status",
      JSON.stringify({ isPremium: true, expirationDate: null, productId: "x" }),
    );
    mockedPurchases.getCustomerInfo.mockRejectedValueOnce(new Error("offline"));

    await expect(premiumService.checkStatus()).resolves.toMatchObject({
      isPremium: true,
    });
  });
});
