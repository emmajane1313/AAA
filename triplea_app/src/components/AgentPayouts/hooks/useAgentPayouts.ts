import { useEffect, useState } from "react";
import { getOwnersPaid } from "../../../../graphql/queries/getOwnersPaid";
import { getCollectorsPaid } from "../../../../graphql/queries/getCollectorsPaid";
import { Account, evmAddress, PublicClient } from "@lens-protocol/client";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { STORAGE_NODE } from "@/lib/constants";

const useAgentPayouts = (lensClient: PublicClient) => {
  const [screen, setScreen] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ownersPaid, setOwnersPaid] = useState<
    {
      amount: number;
      blockTimestamp: string;
      owner: string;
      token: string;
      transactionHash: string;
      profile?: Account;
    }[]
  >([]);
  const [collectorsPaid, setCollectorsPaid] = useState<
    {
      amount: number;
      blockTimestamp: string;
      recipient: string;
      token: string;
      transactionHash: string;
      profile?: Account;
    }[]
  >([]);

  const [hasMore, setHasMore] = useState<{
    owners: boolean;
    collectors: boolean;
  }>({
    owners: true,
    collectors: true,
  });
  const [paginated, setPaginated] = useState<{
    owners: number;
    collectors: number;
  }>({
    owners: 0,
    collectors: 0,
  });

  const handleOrderPayments = async () => {
    setOrdersLoading(true);
    try {
      const owners = await getOwnersPaid(0);
      const collectors = await getCollectorsPaid(0);

      setHasMore({
        collectors: collectors?.data?.orderPayments?.length < 20 ? false : true,
        owners: owners?.data?.agentOwnerPaids?.length < 20 ? false : true,
      });

      setPaginated({
        collectors:
          collectors?.data?.orderPayments?.length == 20
            ? paginated?.collectors + 20
            : paginated?.collectors,
        owners:
          owners?.data?.agentOwnerPaids?.length == 20
            ? paginated?.owners + 20
            : paginated?.owners,
      });

      let collectors_info = await Promise.all(
        collectors?.data?.orderPayments?.map(async (coll: any) => {
          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(coll?.recipient),
            },
            lensClient
          );
          let picture = "";
          let profile: any;

          if (result) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                (result as any)?.[0]?.account?.metadata?.picture?.split(
                  "lens://"
                )?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }

            profile = {
              ...(result as any)?.[0]?.account,
              metadata: {
                ...(result as any)?.[0]?.account?.metadata,
                picture,
              },
            };
          }

          return {
            ...coll,
            profile,
          };
        })
      );

      let owners_info = await Promise.all(
        owners?.data?.agentOwnerPaids?.map(async (coll: any) => {
          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(coll?.owner),
            },
            lensClient
          );
          let picture = "";
          let profile: any;

          if (result) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                (result as any)?.[0]?.account?.metadata?.picture?.split(
                  "lens://"
                )?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }

            profile = {
              ...(result as any)?.[0]?.account,
              metadata: {
                ...(result as any)?.[0]?.account?.metadata,
                picture,
              },
            };
          }

          return {
            ...coll,
            profile,
          };
        })
      );

      setOwnersPaid(owners_info);
      setCollectorsPaid(collectors_info);
    } catch (err: any) {
      console.error(err.message);
    }
    setOrdersLoading(false);
  };

  const handleMorePaid = async () => {
    try {
      let hasMoreOwner: boolean = false,
        hasMoreCollector: boolean = false,
        paginatedOwner: number = 0,
        paginatedCollector: number = 0;
      if (hasMore.collectors) {
        const collectors = await getCollectorsPaid(0);

        let collectors_info = await Promise.all(
          collectors?.data?.orderPayments?.map(async (coll: any) => {
            const result = await fetchAccountsAvailable(
              {
                managedBy: evmAddress(coll?.recipient),
              },
              lensClient
            );
            let picture = "";
            let profile: any;

            if (result) {
              const cadena = await fetch(
                `${STORAGE_NODE}/${
                  (result as any)?.[0]?.account?.metadata?.picture?.split(
                    "lens://"
                  )?.[1]
                }`
              );

              if (cadena) {
                const json = await cadena.json();
                picture = json.item;
              }

              profile = {
                ...(result as any)?.[0]?.account,
                metadata: {
                  ...(result as any)?.[0]?.account?.metadata,
                  picture,
                },
              };
            }

            return {
              ...coll,
              profile,
            };
          })
        );

        setCollectorsPaid([...collectorsPaid, ...collectors_info] as any);

        if (collectors?.data?.orderPayments?.length == 20) {
          hasMoreCollector = true;
          paginatedCollector = paginated?.collectors + 20;
        }
      }

      if (hasMore.owners) {
        const owners = await getOwnersPaid(paginated.owners);

        let owners_info = await Promise.all(
          owners?.data?.agentOwnerPaids?.map(async (coll: any) => {
            const result = await fetchAccountsAvailable(
              {
                managedBy: evmAddress(coll?.owner),
              },
              lensClient
            );
            let picture = "";
            let profile: any;

            if (result) {
              const cadena = await fetch(
                `${STORAGE_NODE}/${
                  (result as any)?.[0]?.account?.metadata?.picture?.split(
                    "lens://"
                  )?.[1]
                }`
              );

              if (cadena) {
                const json = await cadena.json();
                picture = json.item;
              }

              profile = {
                ...(result as any)?.[0]?.account,
                metadata: {
                  ...(result as any)?.[0]?.account?.metadata,
                  picture,
                },
              };
            }

            return {
              ...coll,
              profile,
            };
          })
        );

        setOwnersPaid([...ownersPaid, ...owners_info] as any);

        if (owners?.data?.agentOwnerPaids?.length == 20) {
          hasMoreOwner = true;
          paginatedOwner = paginated?.collectors + 20;
        }
      }

      setHasMore({
        owners: hasMoreOwner,
        collectors: hasMoreCollector,
      });

      setPaginated({
        owners: paginatedOwner,
        collectors: paginatedCollector,
      });
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (ownersPaid?.length < 1 && collectorsPaid?.length < 1 && lensClient) {
      handleOrderPayments();
    }
  }, [lensClient]);

  return {
    screen,
    setScreen,
    ordersLoading,
    ownersPaid,
    collectorsPaid,
    hasMore,
    handleMorePaid,
  };
};

export default useAgentPayouts;
