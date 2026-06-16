/**
 * Network scanner (Type B)
 *
 * Finds camera-like devices that are already JOINED to the venue's Wi-Fi (so
 * they don't broadcast their own SSID and are invisible to a Wi-Fi AP scan).
 *
 * Strategy: derive the local /24 from the current connection's IP, then do a
 * concurrency-limited TCP connect-scan of well-known camera ports. An open
 * port like RTSP (554) is a strong signal of a camera/NVR.
 *
 * This can detect PRESENCE and identity, but NOT physical location (you can't
 * measure RF distance to a client device without monitor mode / root).
 *
 * Requires the native module `react-native-tcp-socket`. Until the dev-client is
 * rebuilt with it, scan() throws NATIVE_UNAVAILABLE and the UI degrades to a
 * "available after app update" state — nothing crashes in the current binary.
 */

import { NativeModules } from "react-native";

import type { WifiConnectionInfo } from "@/services/wifi/wifi.types";

import { CAMERA_PORT_SIGNATURES } from "./camera.database";
import type { NetworkCameraHost, NetworkHostKind } from "./camera.types";

const NATIVE_UNAVAILABLE = "NATIVE_UNAVAILABLE";

// Ports swept per host (subset of signatures, ordered by how indicative they are).
const SWEEP_PORTS = [554, 8554, 37777, 34567, 8000, 80, 8080];

const PROBE_TIMEOUT_MS = 700;
const CONCURRENCY = 32;

/** Lazily load the native TCP module. Returns null if unavailable. */
let cachedTcp: unknown | undefined;
function loadTcp(): {
  createConnection: (...args: unknown[]) => TcpClient;
} | null {
  if (cachedTcp !== undefined) {
    return cachedTcp as {
      createConnection: (...a: unknown[]) => TcpClient;
    } | null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-tcp-socket");
    cachedTcp = mod?.default ?? mod ?? null;
  } catch {
    cachedTcp = null;
  }
  return cachedTcp as {
    createConnection: (...a: unknown[]) => TcpClient;
  } | null;
}

interface TcpClient {
  on: (event: string, cb: (arg?: unknown) => void) => void;
  write: (data: string) => void;
  setEncoding: (encoding: string) => void;
  destroy: () => void;
}

// HTTP ports worth grabbing a banner from (for host identification).
const HTTP_BANNER_PORTS = [80, 8080, 8000];
const BANNER_TIMEOUT_MS = 900;

/** Map an HTTP `Server:` header to a friendlier vendor/device label. */
function labelFromServerHeader(server: string): string | null {
  const s = server.toLowerCase();

  if (s.includes("hikvision")) return "Hikvision";
  if (s.includes("dahua")) return "Dahua";

  if (s.includes("dnvrs") || s.includes("webs")) return "DVR/NVR";

  // Web servers shipped almost exclusively on IP cameras / embedded devices.
  if (
    s.includes("hipcam") ||
    s.includes("ipcamera") ||
    s.includes("goahead") ||
    s.includes("boa/") ||
    s.includes("net-dvr") ||
    s.includes("rtsp")
  ) {
    return "IP Camera";
  }
  // Otherwise return the raw server token (first word), if informative.
  const token = server.split(/[\s/]/)[0]?.trim();
  return token && token.length > 1 ? token : null;
}

interface ScanCallbacks {
  /** Progress 0-1 as hosts are probed. */
  onProgress?: (fraction: number) => void;
  /** Emitted as each suspicious host is confirmed. */
  onHost?: (host: NetworkCameraHost) => void;
}

class NetworkScanner {
  /**
   * True only if the NATIVE socket module is linked in this binary. The JS
   * package is always present once installed, so we must check the native
   * module — otherwise we'd try to scan in a dev-client that can't, and report
   * "no cameras" instead of "available after update".
   */
  isAvailable(): boolean {
    const nativeLinked = !!NativeModules?.TcpSockets;
    const tcp = loadTcp();
    return nativeLinked && !!tcp && typeof tcp.createConnection === "function";
  }

  /** Try to connect to host:port. Resolves true if the port is open. */
  private probePort(host: string, port: number): Promise<boolean> {
    const tcp = loadTcp();
    if (!tcp) return Promise.resolve(false);

    return new Promise<boolean>((resolve) => {
      let settled = false;
      let socket: TcpClient | null = null;

      const finish = (open: boolean) => {
        if (settled) return;
        settled = true;
        try {
          socket?.destroy();
        } catch {
          // ignore
        }

        resolve(open);
      };

      try {
        socket = tcp.createConnection(
          { host, port, timeout: PROBE_TIMEOUT_MS },
          () => finish(true),
        );

        socket.on("error", () => finish(false));
        socket.on("timeout", () => finish(false));
      } catch {
        // Synchronous throw = native module not linked.
        finish(false);
      }

      // Hard cap in case no event fires.
      setTimeout(() => finish(false), PROBE_TIMEOUT_MS + 300);
    });
  }

  /**
   * Open an HTTP connection and read the `Server:` header to identify the
   * device. Returns a friendly label or null. Best-effort — never throws.
   */
  private grabBanner(host: string, port: number): Promise<string | null> {
    const tcp = loadTcp();
    if (!tcp) return Promise.resolve(null);

    return new Promise<string | null>((resolve) => {
      let settled = false;
      let buffer = "";
      let socket: TcpClient | null = null;

      const finish = (label: string | null) => {
        if (settled) return;
        settled = true;
        try {
          socket?.destroy();
        } catch {
          // ignore
        }

        resolve(label);
      };

      const parse = () => {
        const match = /\r\nserver:\s*([^\r\n]+)/i.exec(buffer);
        if (match) finish(labelFromServerHeader(match[1].trim()));
      };

      try {
        socket = tcp.createConnection(
          { host, port, timeout: BANNER_TIMEOUT_MS },
          () => {
            socket?.setEncoding("utf8");
            socket?.write(`HEAD / HTTP/1.0\r\nHost: ${host}\r\n\r\n`);
          },
        );
        socket.on("data", (chunk?: unknown) => {
          buffer += typeof chunk === "string" ? chunk : "";
          if (buffer.length > 2048 || /\r\n\r\n/.test(buffer)) parse();
          if (buffer.length > 4096) finish(null);
        });

        socket.on("error", () => finish(null));
        socket.on("timeout", () => finish(null));
      } catch {
        finish(null);
      }

      setTimeout(() => finish(null), BANNER_TIMEOUT_MS + 300);
    });
  }

  /** Classify a host from the set of open ports that responded. */
  private classifyHost(ip: string, openPorts: number[]): NetworkCameraHost {
    let kind: NetworkHostKind = "generic";
    let confidence: NetworkCameraHost["confidence"] = "low";

    for (const sig of CAMERA_PORT_SIGNATURES) {
      if (!openPorts.includes(sig.port)) continue;

      // Keep the strongest signature seen.
      const rank = { low: 0, medium: 1, high: 2 } as const;

      if (rank[sig.confidence] >= rank[confidence]) {
        confidence = sig.confidence;
        kind = sig.kind;
      }
    }

    return { ip, openPorts, kind, confidence, label: null };
  }

  /**
   * Scan the local /24 for camera-like hosts.
   * @throws NATIVE_UNAVAILABLE when the native module isn't linked.
   */
  async scan(
    connection: WifiConnectionInfo,
    callbacks: ScanCallbacks = {},
  ): Promise<NetworkCameraHost[]> {
    if (!this.isAvailable()) {
      throw new Error(NATIVE_UNAVAILABLE);
    }

    const ip = connection.ip;
    if (!ip || connection.type !== "wifi") {
      return [];
    }

    const octets = ip.split(".");
    if (octets.length !== 4) return [];

    const base = `${octets[0]}.${octets[1]}.${octets[2]}`;
    const ownLast = Number(octets[3]);

    // Build the list of candidate hosts (.1–.254, excluding our own address).
    const hosts: string[] = [];
    for (let i = 1; i <= 254; i++) {
      if (i === ownLast) continue;
      hosts.push(`${base}.${i}`);
    }

    const results: NetworkCameraHost[] = [];
    let processed = 0;

    // Concurrency-limited worker pool over hosts.
    let cursor = 0;
    const worker = async () => {
      while (cursor < hosts.length) {
        const host = hosts[cursor++];
        const open: number[] = [];

        for (const port of SWEEP_PORTS) {
          const isOpen = await this.probePort(host, port);
          if (isOpen) open.push(port);
        }

        if (open.length > 0) {
          const classified = this.classifyHost(host, open);

          // Best-effort identity: read the HTTP banner if a web port is open.
          const httpPort = HTTP_BANNER_PORTS.find((p) => open.includes(p));
          if (httpPort) {
            classified.label = await this.grabBanner(host, httpPort);
          }

          results.push(classified);
          callbacks.onHost?.(classified);
        }

        processed++;
        callbacks.onProgress?.(processed / hosts.length);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, hosts.length) }, () =>
        worker(),
      ),
    );

    // Strongest matches first.
    const rank = { high: 2, medium: 1, low: 0 } as const;
    return results.sort((a, b) => rank[b.confidence] - rank[a.confidence]);
  }
}

export const networkScanner = new NetworkScanner();
export { NATIVE_UNAVAILABLE };
