import React from "react";
import {
    OwnerAddress,
    SharesMarketplaceAddress,
    CW721SharesAddress,
    SplitterAddress,
} from "@/ContractAddresses";
import ShowShares from "@/modules/collections/components/ShowShares";
import PurchaseShares from "@/components/purchase/PurchaseShares";

interface Props {}

const Page = async (props: Props) => {
    return (
        <main>
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
