import { useCallback, useRef, useState } from "react";

interface RssiSample {
  value: number;
  timestamp: number;
}

const MAX_SAMPLES = 80;

function useRssiGraph() {
  const samplesRef = useRef<RssiSample[]>([]);
  const [samples, setSamples] = useState<RssiSample[]>([]);

  const addSample = useCallback((rssi: number) => {
    const sample: RssiSample = {
      value: Math.round(rssi),
      timestamp: Date.now(),
    };

    samplesRef.current = [...samplesRef.current, sample].slice(-MAX_SAMPLES);
    setSamples(samplesRef.current);
  }, []);

  const clear = useCallback(() => {
    samplesRef.current = [];
    setSamples([]);
  }, []);

  return {
    samples,
    addSample,
    clear,
    hasData: samples.length > 1,
  };
}

export { RssiSample, useRssiGraph };
