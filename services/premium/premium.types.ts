interface PremiumStatus {
  isPremium: boolean;
  expirationDate: string | null;
  productId: string | null;
}

interface PremiumProduct {
  identifier: string;
  price: number;
  priceString: string;
  title: string;
  description: string;
}

type PremiumFeature =
  | "history"
  | "tracker_details"
  | "rssi_graph"
  | "export"
  | "filters"
  | "device_profiles"
  | "anti_stalking_config"
  | "wifi_networks"
  | "wifi_channel_analysis"
  | "wifi_signal_graph"
  | "camera_detector";

const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "";

const ENTITLEMENT_ID = "premium";
const PRODUCT_ID = "signal_sense_premium";

export {
  ENTITLEMENT_ID,
  PremiumFeature,
  PremiumProduct,
  PremiumStatus,
  PRODUCT_ID,
  REVENUECAT_API_KEY_ANDROID,
};
