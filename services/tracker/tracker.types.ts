type TrackerType = "airtag" | "tile" | "smarttag" | "chipolo" | "findmy";
type TrackerBrand = "Apple" | "Tile" | "Samsung" | "Chipolo";

interface TrackerInfo {
  isTracker: boolean;
  type: TrackerType | null;
  brand: TrackerBrand | null;
  confidence: "high" | "medium";
}

export { TrackerBrand, TrackerInfo, TrackerType };
