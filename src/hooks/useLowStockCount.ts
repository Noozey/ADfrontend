import { useEffect, useState } from "react";
import { partsApi } from "../api/api";

export function useLowStockCount(enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const res = await partsApi.getAll();
        const lowStock = res.data.filter((p) => p.stockQuantity < 10);
        if (isMounted) setCount(lowStock.length);
      } catch {
        if (isMounted) setCount(0);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return count;
}
