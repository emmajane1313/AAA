import { useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";

const useSales = () => {
  const [salesLoading, setSalesLoading] = useState<boolean>(false);
  const [allSales, setAllSales] = useState<Order[]>([]);

  const handleSales = async () => {
    setSalesLoading(true);

    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setSalesLoading(false);
  };

  useEffect(() => {
    if (allSales?.length < 1) {
      handleSales();
    }
  }, []);

  return {
    allSales,
    salesLoading,
  };
};

export default useSales;
