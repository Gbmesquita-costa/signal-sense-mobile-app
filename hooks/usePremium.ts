import { useCallback, useEffect } from "react";
import { Alert } from "react-native";

import { safePush } from "@/lib/navigation";
import { useRouter } from "expo-router";

import { premiumService } from "@/services/premium";
import { usePremiumStore } from "@/stores/usePremiumStore";

function usePremium() {
  const router = useRouter();
  const {
    isPremium,
    isLoading,
    priceString,
    setIsPremium,
    setLoading,
    setPriceString,
  } = usePremiumStore();

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const status = await premiumService.initialize();
        if (!mounted) return;

        setIsPremium(status.isPremium);

        const products = await premiumService.getProducts();
        if (!mounted) return;

        if (products.length > 0) {
          setPriceString(products[0].priceString);
        }
      } catch {
        // Silently fail — free tier by default
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const unsubscribe = premiumService.addListener((status) => {
      if (mounted) setIsPremium(status.isPremium);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setIsPremium, setLoading, setPriceString]);

  const purchase = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);

      const status = await premiumService.purchase();
      setIsPremium(status.isPremium);

      return status.isPremium;
    } catch (error: unknown) {
      const isCancelled =
        error instanceof Error && error.message.includes("cancelled");

      if (!isCancelled) {
        Alert.alert("Error", "Purchase failed. Please try again.");
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [setIsPremium, setLoading]);

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);

      const status = await premiumService.restore();
      setIsPremium(status.isPremium);

      if (!status.isPremium) {
        Alert.alert("Restore", "No previous purchases found.");
      }

      return status.isPremium;
    } catch {
      Alert.alert("Error", "Restore failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [setIsPremium, setLoading]);

  const openPaywall = useCallback(() => {
    safePush(router, "/paywall");
  }, [router]);

  return {
    isPremium,
    isLoading,
    priceString,
    purchase,
    restore,
    openPaywall,
  };
}

export { usePremium };
