import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ENTITLEMENT_ID,
  REVENUECAT_API_KEY_ANDROID,
  type PremiumProduct,
  type PremiumStatus,
} from "./premium.types";

const PREMIUM_CACHE_KEY = "@signalsense:premium_status";

const FREE_STATUS: PremiumStatus = {
  isPremium: false,
  expirationDate: null,
  productId: null,
};

/** A null expiration date means a lifetime (non-expiring) entitlement. */
function isExpired(expirationDate: string | null): boolean {
  if (!expirationDate) return false;

  const expiresAt = Date.parse(expirationDate);
  return !Number.isNaN(expiresAt) && expiresAt <= Date.now();
}

class PremiumService {
  private initialized = false;
  private listeners: ((status: PremiumStatus) => void)[] = [];

  async initialize(): Promise<PremiumStatus> {
    if (this.initialized) return this.checkStatus();

    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
      this.initialized = true;

      // Listen for customer info changes
      Purchases.addCustomerInfoUpdateListener((info) => {
        const status = this.parseCustomerInfo(info);

        this.cacheStatus(status);
        this.listeners.forEach((cb) => cb(status));
      });

      return this.checkStatus();
    } catch (error) {
      // If RevenueCat fails (no API key, network issue), fall back to cached status
      console.warn("[PremiumService] Init failed, using cache:", error);
      return this.getCachedStatus();
    }
  }

  async checkStatus(): Promise<PremiumStatus> {
    try {
      if (!this.initialized) return this.getCachedStatus();

      const customerInfo = await Purchases.getCustomerInfo();
      const status = this.parseCustomerInfo(customerInfo);

      await this.cacheStatus(status);
      return status;
    } catch {
      return this.getCachedStatus();
    }
  }

  async getProducts(): Promise<PremiumProduct[]> {
    try {
      if (!this.initialized) return [];

      const offerings = await Purchases.getOfferings();
      const current = offerings.current;

      if (!current) return [];
      return current.availablePackages.map((pkg: PurchasesPackage) => ({
        identifier: pkg.product.identifier,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
        title: pkg.product.title,
        description: pkg.product.description,
      }));
    } catch {
      return [];
    }
  }

  async purchase(): Promise<PremiumStatus> {
    if (!this.initialized) {
      throw new Error("PremiumService not initialized");
    }

    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current || current.availablePackages.length === 0) {
      throw new Error("No products available");
    }

    const pkg = current.availablePackages[0];
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    const status = this.parseCustomerInfo(customerInfo);
    await this.cacheStatus(status);

    return status;
  }

  async restore(): Promise<PremiumStatus> {
    if (!this.initialized) {
      throw new Error("PremiumService not initialized");
    }

    const customerInfo = await Purchases.restorePurchases();
    const status = this.parseCustomerInfo(customerInfo);

    await this.cacheStatus(status);
    return status;
  }

  addListener(cb: (status: PremiumStatus) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private parseCustomerInfo(info: CustomerInfo): PremiumStatus {
    const entitlement = info.entitlements.active[ENTITLEMENT_ID];
    return {
      isPremium: !!entitlement,
      expirationDate: entitlement?.expirationDate ?? null,
      productId: entitlement?.productIdentifier ?? null,
    };
  }

  private async cacheStatus(status: PremiumStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify(status));
    } catch {
      // Silently fail cache write
    }
  }

  private async getCachedStatus(): Promise<PremiumStatus> {
    try {
      const cached = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
      if (cached) {
        const status: PremiumStatus = JSON.parse(cached);

        // The cache is only a fallback for when RevenueCat is unreachable;
        // it must not keep a subscription alive past its expiration date.
        if (status.isPremium && isExpired(status.expirationDate)) {
          return { ...FREE_STATUS };
        }

        return status;
      }
    } catch {
      // Silently fail cache read
    }

    return { ...FREE_STATUS };
  }
}

export const premiumService = new PremiumService();
