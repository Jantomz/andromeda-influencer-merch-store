import Layout from "@/modules/general/components/Layout";
import { PurchaseShares } from "@/modules/marketplace/components";
import { Center, Image, Link, Text, VStack } from "@chakra-ui/react";
import { ParticlesObject } from "./particles";
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
            <div className="h-24"></div>
            <header className="flex gap-2 flex-col justify-center items-center z-10 relative">
                <h1 className="z-30 text-7xl max-md:text-5xl font-semibold w-full max-md:w-3/4 text-center text-white mt-36">
                    Your Decentralized Ticketing
                </h1>
                <h2 className="z-40 text-3xl max-md:text-2xl font-semibold w-1/2 max-md:w-3/4 text-center text-white">
                    Ticket3
                </h2>
                {/* Find a place to put these */}
                {/* <ShowShares SplitterAddress={SplitterAddress} /> */}
                {/* <PurchaseShares
                CW721SharesAddress={CW721SharesAddress}
                MarketplaceAddress={SharesMarketplaceAddress}
                OwnerAddress={OwnerAddress}
            /> */}
                <div className="absolute inset-0 z-0">
                    <ParticlesObject position="absolute" />
                </div>
            </header>
        </main>
    );
};

export default Page;
