import { useExecuteContract, useSimulateExecute } from "@/lib/andrjs";
import { MakeEvent, MakeShares, UpdateSharesSplits } from "@/modules/admin";
import SendShares from "@/modules/admin/components/SendShares";
import React from "react";
import {
    CW721EventsAddress,
    CW721TicketsAddress,
    SharesMarketplaceAddress,
    OwnerAddress,
    CW721SharesAddress,
    SplitterAddress,
} from "@/ContractAddresses";

interface Props {}

const Page = async (props: Props) => {
    return (
        <main>
            <MakeEvent
                CW721Address={CW721EventsAddress}
                TicketCW721Address={CW721TicketsAddress}
            />
            <MakeShares CW721SharesAddress={CW721SharesAddress} />
            <UpdateSharesSplits
                SplitterAddress={SplitterAddress}
                CW721SharesAddress={CW721SharesAddress}
                MarketplaceAddress={SharesMarketplaceAddress}
                OwnerAddress={OwnerAddress}
            />
            <SendShares
                MarketplaceAddress={SharesMarketplaceAddress}
                OwnerAddress={OwnerAddress}
                CW721SharesAddress={CW721SharesAddress}
            />
        </main>
    );
};

export default Page;
