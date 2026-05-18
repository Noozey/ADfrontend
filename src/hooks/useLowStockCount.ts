import { useEffect, useState } from "react";
import { partsApi } from "../api/api";

export function useLowStockCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await partsApi.getAll();
      const lowStock = res.data.filter((p) => p.stockQuantity < 10);
      setCount(lowStock.length);
    })();
  }, []);

  return count;
}
