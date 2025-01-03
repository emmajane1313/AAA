import { NFTData } from "@/components/Common/types/common.types";
import {
  Agent,
  DropInterface,
} from "@/components/Dashboard/types/dashboard.types";
import { Account, AccountStats, evmAddress, PublicClient } from "@lens-protocol/client";
import { useEffect, useState } from "react";
import fetchAccount from "../../../../graphql/lens/queries/account";
import { STORAGE_NODE } from "@/lib/constants";
import fetchStats from "../../../../graphql/lens/queries/accountStats";
import { getDropCollections } from "../../../../graphql/queries/getDropCollections";
import { getUserAgentsPaginated } from "../../../../graphql/queries/getUserAgentsPaginated";
import { getOrdersPaginated } from "../../../../graphql/queries/getOrdersPaginated";


const useUser = (username: string, lensClient: PublicClient) => {
  const [screen, setScreen] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<
    | (Account & {
        stats: AccountStats;
      })
    | undefined
  >();
  const [collected, setCollected] = useState<NFTData[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [drops, setDrops] = useState<DropInterface[]>([]);
  const [hasMore, setHasMore] = useState<{
    agents: boolean;
    drops: boolean;
    collected: boolean;
  }>({
    agents: true,
    drops: true,
    collected: true,
  });
  const [paginated, setPaginated] = useState<{
    agents: number;
    drops: number;
    collected: number;
  }>({
    agents: 0,
    drops: 0,
    collected: 0,
  });
  const [infoLoading, setInfoLoading] = useState<boolean>(false);
  const [itemsLoading, setItemsLoading] = useState<boolean>(false);

  const handleUserInfo = async () => {
    setInfoLoading(true);
    try {
      const newAcc = await fetchAccount(
        {
          username: {
            localName: username,
          },
        },
        lensClient
      );
      let ownerPicture = "";
      let ownerProfile: any;


      if (newAcc) {
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            (newAcc as any)?.metadata?.picture?.split("lens://")?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          ownerPicture = json.item;
        }


        const stats = await fetchStats(
          {
            account: (newAcc as any)?.owner,
          },
          lensClient
        );

        ownerProfile = {
          ...(newAcc as any),
          metadata: {
            ...(newAcc as any)?.metadata,
            picture: ownerPicture,
          },
          stats: stats,
        };
      }



      if ((newAcc as any)?.owner) {
        setUserInfo(ownerProfile);
      }

      handleItems(
        newAcc as Account & {
          stats: AccountStats;
        }
      );
    } catch (err: any) {
      console.error(err.message);
    }
    setInfoLoading(false);
  };

  const handleItems = async (
    info: Account & {
      stats: AccountStats;
    }
  ) => {
    if (!info) return;
    setItemsLoading(true);
    try {
      const agents = await getUserAgentsPaginated(info?.owner, 0);
      const drops = await getDropCollections(info?.owner, 0);
      const collected = await getOrdersPaginated(info?.owner, 0);
   
      setHasMore({
        agents: agents?.data?.agentCreateds?.length == 20 ? true : false,
        collected: collected?.data?.orders?.length == 20 ? true : false,
        drops: drops?.data?.dropCreateds?.length == 20 ? true : false,
      });
 
      setPaginated({
        agents:
          agents?.data?.agentCreateds?.length == 20
            ? paginated?.agents + 20
            : paginated?.agents,
        collected:
          collected?.data?.orders?.length == 20
            ? paginated?.collected + 20
            : paginated?.collected,
        drops:
          drops?.data?.dropCreateds?.length == 20
            ? paginated?.drops + 20
            : paginated?.drops,
      });

      setCollected(collected?.data?.orders);
      setAgents(agents?.data?.agentCreateds);
      setDrops(drops?.data?.dropCreateds);
    } catch (err: any) {
      console.error(err.message);
    }
    setItemsLoading(false);
  };

  const handleMoreItems = async () => {
    setItemsLoading(true);
    try {
      let hasMoreCollected: boolean = false,
        hasMoreDrops: boolean = false,
        hasMoreAgents: boolean = false,
        paginatedCollected: number = 0,
        paginatedAgents: number = 0,
        paginatedDrops: number = 0;

      if (hasMore.collected) {
        const collectedData = await getOrdersPaginated(
          userInfo?.owner,
          paginated?.agents
        );
        setCollected([
          ...collected,
          ...(collectedData?.data?.orderPayments || []),
        ] as any);

        if (collectedData?.data?.orderPayments?.length == 20) {
          hasMoreCollected = true;
          paginatedCollected = paginated?.collected + 20;
        }
      }

      if (hasMore.drops) {
        const dropsData = await getDropCollections(userInfo?.owner, paginated?.drops);
        setDrops([...drops, ...(dropsData?.data?.dropCreateds || [])] as any);

        if (dropsData?.data?.dropCreateds?.length == 20) {
          hasMoreDrops = true;
          paginatedDrops = paginated?.drops + 20;
        }
      }

      if (hasMore.agents) {
        const agentsData = await getUserAgentsPaginated(
          userInfo?.owner,
          paginated?.agents
        );
        setAgents([
          ...agents,
          ...(agentsData?.data?.agentCreateds || []),
        ] as any);

        if (agentsData?.data?.agentCreateds?.length == 20) {
          hasMoreAgents = true;
          paginatedAgents = paginated?.agents + 20;
        }
      }

      setHasMore({
        collected: hasMoreCollected,
        agents: hasMoreCollected,
        drops: hasMoreDrops,
      });

      setPaginated({
        collected: paginatedCollected,
        agents: paginatedAgents,
        drops: paginatedDrops,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setItemsLoading(false);
  };

  useEffect(() => {
    if (username && lensClient) {
      handleUserInfo();
    }
  }, [username, lensClient]);

  return {
    screen,
    setScreen,
    userInfo,
    drops,
    collected,
    agents,
    infoLoading,
    itemsLoading,
    handleMoreItems,
    hasMore,
  };
};

export default useUser;
