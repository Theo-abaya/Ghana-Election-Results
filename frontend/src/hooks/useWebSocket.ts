import { useEffect, useRef } from "react";
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToPresidentialResults,
  subscribeToConstituency,
  subscribeToRegion,
  unsubscribeAll,
} from "../services/websocket";

export const usePresidentialWebSocket = (callback: (data: any) => void) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = connectWebSocket();

    subscribeToPresidentialResults((data) => {
      callbackRef.current(data);
    });

    return () => {
      unsubscribeAll();
      disconnectWebSocket();
    };
  }, []);
};

export const useConstituencyWebSocket = (
  constituencyId: string,
  callback: (data: any) => void
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!constituencyId) return;

    const socket = connectWebSocket();

    subscribeToConstituency(constituencyId, (data) => {
      callbackRef.current(data);
    });

    return () => {
      unsubscribeAll();
      disconnectWebSocket();
    };
  }, [constituencyId]);
};

export const useRegionWebSocket = (
  region: string,
  callback: (data: any) => void
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!region) return;

    const socket = connectWebSocket();

    subscribeToRegion(region, (data) => {
      callbackRef.current(data);
    });

    return () => {
      unsubscribeAll();
      disconnectWebSocket();
    };
  }, [region]);
};
