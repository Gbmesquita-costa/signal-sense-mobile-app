import { trackerDetector } from "../tracker.detector";

const toBase64 = (bytes: number[]) => Buffer.from(bytes).toString("base64");

const emptyDevice = {
  name: null,
  localName: null,
  manufacturerData: null,
  serviceUUIDs: null,
};

describe("trackerDetector", () => {
  it("detects an AirTag from Apple FindMy manufacturer data", () => {
    const result = trackerDetector.detect({
      ...emptyDevice,
      manufacturerData: toBase64([0x4c, 0x00, 0x12, 0x19, 0x10, 0x00]),
    });

    expect(result).toEqual({
      isTracker: true,
      type: "airtag",
      brand: "Apple",
      confidence: "high",
    });
  });

  it("does not flag regular Apple devices as trackers", () => {
    const result = trackerDetector.detect({
      ...emptyDevice,
      name: "iPhone",
      manufacturerData: toBase64([0x4c, 0x00, 0x10, 0x05, 0x01]),
    });

    expect(result.isTracker).toBe(false);
  });

  it("detects Tile by company id and by service UUID", () => {
    expect(
      trackerDetector.detect({
        ...emptyDevice,
        manufacturerData: toBase64([0xd7, 0x00, 0x01]),
      }),
    ).toMatchObject({ isTracker: true, type: "tile", brand: "Tile" });

    expect(
      trackerDetector.detect({
        ...emptyDevice,
        serviceUUIDs: ["0000FEED-0000-1000-8000-00805F9B34FB"],
      }),
    ).toMatchObject({ isTracker: true, type: "tile", brand: "Tile" });
  });

  it("falls back to name patterns, including localName", () => {
    expect(
      trackerDetector.detect({ ...emptyDevice, localName: "Galaxy SmartTag" }),
    ).toMatchObject({ isTracker: true, type: "smarttag", brand: "Samsung" });

    expect(
      trackerDetector.detect({ ...emptyDevice, name: "Chipolo ONE" }),
    ).toMatchObject({ isTracker: true, type: "chipolo" });
  });

  it("returns a non-tracker result for unknown devices", () => {
    expect(
      trackerDetector.detect({ ...emptyDevice, name: "Mi Band 7" }),
    ).toMatchObject({ isTracker: false, type: null, brand: null });
  });

  it("decodes manufacturer data of any padding length", () => {
    // 6, 5 and 4 bytes encode with zero, one and two "=" padding characters.
    for (const bytes of [
      [0xd7, 0x00, 0x01, 0x02, 0x03, 0x04],
      [0xd7, 0x00, 0x01, 0x02, 0x03],
      [0xd7, 0x00, 0x01, 0x02],
    ]) {
      const manufacturerData = toBase64(bytes);

      expect(
        trackerDetector.detect({ ...emptyDevice, manufacturerData }),
      ).toMatchObject({ isTracker: true, brand: "Tile" });
    }
  });

  it("falls through to the name when manufacturer data is too short", () => {
    expect(
      trackerDetector.detect({
        ...emptyDevice,
        name: "AirTag",
        manufacturerData: toBase64([0x4c, 0x00]),
      }),
    ).toMatchObject({ isTracker: true, type: "airtag", confidence: "high" });

    expect(
      trackerDetector.detect({
        ...emptyDevice,
        manufacturerData: toBase64([0x4c]),
      }).isTracker,
    ).toBe(false);
  });

  it("prefers the advertised name over localName", () => {
    expect(
      trackerDetector.detect({
        ...emptyDevice,
        name: "Find My Keys",
        localName: "Tile Mate",
      }),
    ).toMatchObject({ type: "findmy", brand: "Apple", confidence: "medium" });
  });

  it("ignores an empty service UUID list", () => {
    expect(
      trackerDetector.detect({ ...emptyDevice, serviceUUIDs: [] }).isTracker,
    ).toBe(false);
  });
});
