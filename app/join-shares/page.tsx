import Layout from "@/modules/general/components/Layout";
import { PurchaseShares } from "@/modules/marketplace/components";
import React from "react";
import {
    OwnerAddress,
    SharesMarketplaceAddress,
    CW721SharesAddress,
    SplitterAddress,
} from "@/ContractAddresses";
import ShowShares from "@/modules/collections/components/ShowShares";

interface Props {}

const Page = async (props: Props) => {
    // TODO: Add stats on this page, number of events, graph of shareholders
    return (
        <main>
            {/* Find a place to put these */}
            <ShowShares SplitterAddress={SplitterAddress} />
            <PurchaseShares
                CW721SharesAddress={CW721SharesAddress}
                MarketplaceAddress={SharesMarketplaceAddress}
                OwnerAddress={OwnerAddress}
            />
        </main>
    );
};

export default Page;
