import {
  APPLE_FINDMY_LENGTH,
  APPLE_FINDMY_TYPE,
  TRACKER_COMPANY_IDS,
  TRACKER_NAME_PATTERNS,
  TRACKER_SERVICE_UUIDS,
} from "./tracker.database";
import type { TrackerInfo } from "./tracker.types";

interface DetectInput {
  name: string | null;
  localName: string | null;
  manufacturerData: string | null;
  serviceUUIDs: string[] | null;
}

const NOT_TRACKER: TrackerInfo = {
  isTracker: false,
  type: null,
  brand: null,
  confidence: "medium",
};

class TrackerDetector {
  detect(device: DetectInput): TrackerInfo {
    // Priority 1: Check manufacturer data (most reliable)
    if (device.manufacturerData) {
      const result = this.detectByManufacturerData(device.manufacturerData);
      if (result) return result;
    }

    // Priority 2: Check service UUIDs
    if (device.serviceUUIDs && device.serviceUUIDs.length > 0) {
      const result = this.detectByServiceUUIDs(device.serviceUUIDs);
      if (result) return result;
    }

    // Priority 3: Check name patterns (least reliable)
    const name = device.name || device.localName;

    if (name) {
      const result = this.detectByName(name);
      if (result) return result;
    }

    return NOT_TRACKER;
  }

  private detectByManufacturerData(base64Data: string): TrackerInfo | null {
    try {
      const bytes = this.base64ToBytes(base64Data);
      if (bytes.length < 2) return null;

      // Company ID is the first 2 bytes (little-endian)
      const companyId = bytes[0] | (bytes[1] << 8);
      const companyInfo = TRACKER_COMPANY_IDS[companyId];

      if (!companyInfo) return null;

      // Apple-specific: distinguish AirTag from regular Apple devices
      if (companyId === 0x004c) {
        return this.detectAppleTracker(bytes);
      }

      // For other known tracker companies, mark as tracker
      return {
        isTracker: true,
        type: companyInfo.defaultType,
        brand: companyInfo.brand,
        confidence: "high",
      };
    } catch {
      return null;
    }
  }

  private detectAppleTracker(bytes: Uint8Array): TrackerInfo | null {
    // Apple manufacturer data format:
    // [company_id_lo, company_id_hi, type, length, ...payload]
    if (bytes.length < 4) return null;

    const type = bytes[2];
    const length = bytes[3];

    // FindMy / AirTag advertisement: type 0x12, length 0x19
    if (type === APPLE_FINDMY_TYPE && length === APPLE_FINDMY_LENGTH) {
      return {
        isTracker: true,
        type: "airtag",
        brand: "Apple",
        confidence: "high",
      };
    }

    // Other Apple FindMy-compatible devices may have different patterns
    // but we don't want to flag every iPhone/Mac as a tracker
    return null;
  }

  private detectByServiceUUIDs(uuids: string[]): TrackerInfo | null {
    const normalizedUuids = uuids.map((u) => u.toLowerCase());

    for (const known of TRACKER_SERVICE_UUIDS) {
      if (normalizedUuids.includes(known.uuid.toLowerCase())) {
        return {
          isTracker: true,
          type: known.type,
          brand: known.brand,
          confidence: "high",
        };
      }
    }

    return null;
  }

  private detectByName(name: string): TrackerInfo | null {
    for (const { pattern, type, brand, confidence } of TRACKER_NAME_PATTERNS) {
      if (pattern.test(name)) {
        return { isTracker: true, type, brand, confidence };
      }
    }

    return null;
  }

  private base64ToBytes(base64: string): Uint8Array {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }

    const len = base64.length;
    let bufferLength = (len * 3) / 4;

    if (base64[len - 1] === "=") bufferLength--;
    if (base64[len - 2] === "=") bufferLength--;

    const bytes = new Uint8Array(bufferLength);
    let p = 0;

    for (let i = 0; i < len; i += 4) {
      const encoded1 = lookup[base64.charCodeAt(i)];
      const encoded2 = lookup[base64.charCodeAt(i + 1)];

      const encoded3 = lookup[base64.charCodeAt(i + 2)];
      const encoded4 = lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);

      if (p < bufferLength)
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      if (p < bufferLength)
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return bytes;
  }
}

export const trackerDetector = new TrackerDetector();
