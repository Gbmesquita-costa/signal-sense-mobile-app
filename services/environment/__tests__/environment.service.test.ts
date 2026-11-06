import { Magnetometer, type MagnetometerMeasurement } from "expo-sensors";

import {
  EnvironmentService,
  type EnvironmentState,
} from "../environment.service";

type Listener = (data: MagnetometerMeasurement) => void;

describe("EnvironmentService", () => {
  let listeners: Listener[];
  let removeSpy: jest.Mock;

  beforeEach(() => {
    listeners = [];
    removeSpy = jest.fn();
    jest.spyOn(Magnetometer, "setUpdateInterval").mockImplementation(() => {});
    jest.spyOn(Magnetometer, "addListener").mockImplementation((listener) => {
      listeners.push(listener);
      return { remove: removeSpy } as unknown as ReturnType<
        typeof Magnetometer.addListener
      >;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  function emit(i: number, z: number) {
    listeners.forEach((l) => l({ x: 0, y: 0, z, timestamp: i * 0.05 }));
  }

  it("delivers filtered readings and drops isolated spikes", () => {
    const service = new EnvironmentService();
    const states: EnvironmentState[] = [];
    service.start((s) => states.push(s));

    for (let i = 0; i < 30; i++) emit(i, i === 20 ? 900 : 45);

    expect(states).toHaveLength(29);
    states.forEach((s) => {
      expect(s.data!.magnitude).toBeCloseTo(45, 6);
      expect(s.status).toBe("stable");
    });
  });

  it("keeps a single native subscription when started twice", () => {
    const service = new EnvironmentService();
    const first = jest.fn();
    const second = jest.fn();

    service.start(first);
    service.start(second);
    emit(0, 45);

    expect(Magnetometer.addListener).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("removes the subscription and stops calling back on stop", () => {
    const service = new EnvironmentService();
    const callback = jest.fn();

    service.start(callback);
    service.stop();
    emit(0, 45);

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });
});
