import { useState } from "react";

const useHeader = () => {
  const [openAccount, setOpenAccount] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const handleSearch = async (target: string) => {
    setSearchLoading(true);
    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setSearchLoading(false);
  };

  return {
    openAccount,
    setOpenAccount,
    handleSearch,
    searchLoading,
  };
};

export default useHeader;
