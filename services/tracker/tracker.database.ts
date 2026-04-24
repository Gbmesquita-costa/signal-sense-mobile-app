import type { TrackerBrand, TrackerType } from "./tracker.types";

// BLE Company IDs that are associated with known tracker manufacturers
// Reference: https://www.bluetooth.com/specifications/assigned-numbers/company-identifiers
const TRACKER_COMPANY_IDS: Record<
  number,
  { brand: TrackerBrand; defaultType: TrackerType }
> = {
  0x004c: { brand: "Apple", defaultType: "findmy" }, // Apple (AirTag, FindMy accessories)
  0x00d7: { brand: "Tile", defaultType: "tile" }, // Tile Inc.
  0x0075: { brand: "Samsung", defaultType: "smarttag" }, // Samsung (SmartTag)
};

// Known name patterns for tracker devices
const TRACKER_NAME_PATTERNS: {
  pattern: RegExp;
  type: TrackerType;
  brand: TrackerBrand;
  confidence: "high" | "medium";
}[] = [
  { pattern: /^AirTag/i, type: "airtag", brand: "Apple", confidence: "high" },
  {
    pattern: /^Find\s?My/i,
    type: "findmy",
    brand: "Apple",
    confidence: "medium",
  },
  { pattern: /^Tile/i, type: "tile", brand: "Tile", confidence: "high" },
  {
    pattern: /^SmartTag/i,
    type: "smarttag",
    brand: "Samsung",
    confidence: "high",
  },
  {
    pattern: /^Chipolo/i,
    type: "chipolo",
    brand: "Chipolo",
    confidence: "high",
  },
  {
    pattern: /^Galaxy\s?SmartTag/i,
    type: "smarttag",
    brand: "Samsung",
    confidence: "high",
  },
];

// Known service UUIDs associated with tracker devices
const TRACKER_SERVICE_UUIDS: {
  uuid: string;
  type: TrackerType;
  brand: TrackerBrand;
}[] = [
  // Tile uses a specific service UUID
  { uuid: "0000feed-0000-1000-8000-00805f9b34fb", type: "tile", brand: "Tile" },
  { uuid: "0000feec-0000-1000-8000-00805f9b34fb", type: "tile", brand: "Tile" },
];

// Apple FindMy/AirTag payload detection
// The manufacturer data for Apple starts with company ID 0x004C
// followed by a type byte. Type 0x12 with length 0x19 = FindMy/AirTag advertisement
const APPLE_FINDMY_TYPE = 0x12;
const APPLE_FINDMY_LENGTH = 0x19;

export {
  APPLE_FINDMY_LENGTH,
  APPLE_FINDMY_TYPE,
  TRACKER_COMPANY_IDS,
  TRACKER_NAME_PATTERNS,
  TRACKER_SERVICE_UUIDS,
};
