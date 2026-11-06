import { act, renderHook } from "@testing-library/react-native";

import { useEnvironment } from "@/hooks/useEnvironment";
import { environmentService } from "@/services/environment/environment.service";
import { historyService } from "@/services/history";

jest.mock("@/services/history", () => ({
  historyService: {
    createEnvironmentSession: jest.fn(),
    addEnvironmentSamples: jest.fn(async () => {}),
    finishEnvironmentSession: jest.fn(async () => {}),
  },
}));

type Callback = Parameters<typeof environmentService.start>[0];

const history = historyService as jest.Mocked<typeof historyService>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("useEnvironment lifecycle", () => {
  let startSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    startSpy = jest
      .spyOn(environmentService, "start")
      .mockImplementation(() => {});
    jest.spyOn(environmentService, "stop").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("does not subscribe when stopped while checking availability", async () => {
    const availability = deferred<boolean>();
    jest
      .spyOn(environmentService, "isAvailable")
      .mockReturnValue(availability.promise);

    const { result } = await renderHook(() => useEnvironment());

    let starting!: Promise<void>;
    await act(async () => {
      starting = result.current.startMonitoring();
    });
    await act(async () => result.current.stopMonitoring());

    await act(async () => {
      availability.resolve(true);
      await starting;
    });

    expect(startSpy).not.toHaveBeenCalled();
    expect(result.current.state).toBe("idle");
  });

  it("closes a session that is created after monitoring stopped", async () => {
    jest.spyOn(environmentService, "isAvailable").mockResolvedValue(true);
    const session = deferred<string>();
    history.createEnvironmentSession.mockReturnValue(session.promise);

    const { result } = await renderHook(() => useEnvironment());
    await act(() => result.current.startMonitoring());

    const callback: Callback = startSpy.mock.calls[0][0];
    await act(async () =>
      callback({
        data: { x: 0, y: 0, z: 45, magnitude: 45 },
        status: "stable",
        isAvailable: true,
      }),
    );
    await act(async () => result.current.stopMonitoring());

    await act(async () => {
      session.resolve("late-session");
      await session.promise;
    });

    expect(history.finishEnvironmentSession).toHaveBeenCalledWith(
      "late-session",
    );
  });

  it("stops the sensor on unmount", async () => {
    const { unmount } = await renderHook(() => useEnvironment());
    await unmount();

    expect(environmentService.stop).toHaveBeenCalled();
  });
});
