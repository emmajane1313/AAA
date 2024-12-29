import { Account, AccountStats } from "@lens-protocol/client";

export type UserInfoProps = {
  userInfo:
    | (Account & {
        stats: AccountStats;
      })
    | undefined;
};
