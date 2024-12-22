import { useEffect, useState } from "react";
import { NFTData } from "../types/common.types";

const useGallery = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNFTs = async (page: number): Promise<NFTData[]> => {
    return Array.from({ length: 20 }, (_, id: number) => ({
      id,
      cover: "",
      title: "",
      description: "",
      tokenIds: [],
      agents: [],
      prices: [],
      tokens: [],
      artist: "",
      blocktimestamp: "",
      amount: 2,
      amountSold: 0,
    }));
  };

  const getRandomSize = () => {
    const sizes = [
      "row-[span_20_/_span_20] w-full",
      "row-[span_30_/_span_30] w-full",
      "row-[span_35_/span_35_] w-full",
    ];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  useEffect(() => {
    const loadInitialNFTs = async () => {
      setLoading(true);
      const initialNFTs = await fetchNFTs(1);
      setNfts(initialNFTs);
      setLoading(false);
    };

    loadInitialNFTs();
  }, []);

  const fetchMoreNFTs = async () => {
    setLoading(true);
    const newPage = page + 1;
    const newImages = await fetchNFTs(newPage);
    setNfts((prev) => [...prev, ...newImages]);
    setPage(newPage);
    setLoading(false);
  };

  return {
    fetchMoreNFTs,
    nfts,
    getRandomSize,
    hasMore,
    loading,
  };
};

export default useGallery;
