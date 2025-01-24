"use client";
import React, { FC, useEffect, useState } from "react";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useAndromedaStore } from "@/zustand/andromeda";

interface PurchaseSharesProps {
    CW721SharesAddress: string;
    MarketplaceAddress: string;
    OwnerAddress: string;
}
const PurchaseShares: FC<PurchaseSharesProps> = (props) => {
    const { toast } = useToast();

    const { MarketplaceAddress, CW721SharesAddress, OwnerAddress } = props;
    const client = useAndromedaClient();
    const [buyableShares, setBuyableShares] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sharesProcessed, setSharesProcessed] = useState(0);
    const [sharesLength, setSharesLength] = useState(0);
    const [userShares, setUserShares] = useState<any[]>([]);

    const { accounts } = useAndromedaStore();
    const userAddress = accounts[0]?.address;

    const queryShares = useQueryContract(CW721SharesAddress);
    const simulatePurchase = useSimulateExecute(MarketplaceAddress);
    const executePurchase = useExecuteContract(MarketplaceAddress);

    const fetchData = async () => {
        setLoading(true);
        if (!client || !queryShares) {
            setLoading(false);
            return;
        }
        try {
            setSharesProcessed(0);
            const tokens = await queryShares({
                all_tokens: {
                    limit: 100,
                },
            });

            let marketplaceShares = [];
            if (userAddress === OwnerAddress) {
                marketplaceShares = await queryShares({
                    tokens: {
                        owner: MarketplaceAddress,
                        limit: 100,
                    },
                });
            }
            const userShares = await queryShares({
                tokens: {
                    owner: userAddress,
                    limit: 100,
                },
            });

            const finalUserShares = userShares.tokens.concat(
                marketplaceShares.tokens
            );

            setUserShares(finalUserShares);
            setSharesLength(tokens.tokens.length);

            let tempSharesList = [];

            const tokenList = tokens.tokens;

            let count = 0;

            for (const token of tokenList) {
                const tokenInfo = await queryShares({
                    all_nft_info: {
                        token_id: token,
                    },
                });

                if (tokenInfo.access.owner === MarketplaceAddress) {
                    tempSharesList.push(token);
                }
                count++;
                setSharesProcessed(count);
            }

            setBuyableShares(tempSharesList);

            setLoading(false);
            setSharesLength(0);
            setSharesProcessed(0);
        } catch (error) {
            toast({
                title: "Error getting shares",
                description: "There was an error getting shares",
                duration: 5000,
                variant: "destructive",
            });
            setLoading(false);

            console.error("Error querying contract:", error);
        }
    };

    useEffect(() => {
        fetchData();

        return () => {
            setBuyableShares([]);
        };
    }, [queryShares, client]);

    const handlePurchaseShare = async () => {
        setLoading(true);
        if (!client) {
            setLoading(false);
            return;
        }

        // Finds the actual next possible ticket to purchase to avoid race conditions?

        try {
            const result = await simulatePurchase(
                {
                    buy: {
                        token_address: CW721SharesAddress,
                        token_id: buyableShares[0],
                    },
                },
                [
                    {
                        denom: "uandr",
                        amount: "500000",
                    },
                ]
            );

            await executePurchase(
                {
                    buy: {
                        token_address: CW721SharesAddress,
                        token_id: buyableShares[0],
                    },
                },
                {
                    amount: [
                        {
                            denom: result.amount[0].denom,
                            amount: result.amount[0].amount,
                        },
                    ],
                    gas: result.gas,
                },
                "Purchase ticket",
                [
                    {
                        denom: result.amount[0].denom,
                        amount: "5000",
                    },
                ]
            );

            toast({
                title: "Share purchased",
                description: "You have successfully purchased a share",
                duration: 5000,
            });
            setLoading(false);

            fetchData();
        } catch (error) {
            toast({
                title: "Error purchasing share",
                description: "There was an error purchasing a share",
                duration: 5000,
                variant: "destructive",
            });
            console.error("Error purchasing share:", error);
        }
    };

    return (
        <>
            {loading ? (
                <div className="text-center text-2xl mt-4 text-white">
                    <div className="flex justify-center items-center space-x-2 flex-col">
                        <span className="text-xs">Loading Shares...</span>
                        <br></br>
                        {sharesProcessed > 0 && sharesLength > 0 && (
                            <Progress
                                value={sharesProcessed}
                                max={sharesLength}
                                className="[&>*]:bg-blue-800 w-1/2"
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center mt-4 text-white">
                    <div className="text-xl mb-2">
                        {buyableShares.length} / 100 shares available for
                        purchase
                    </div>
                    <div className="text-xl mb-2">
                        You own {userShares.length} shares
                    </div>
                    {userAddress === OwnerAddress && (
                        <div className="text-sm mb-2 text-gray-200">
                            Shares not yet sold by the marketplace are owned by
                            the owner address
                        </div>
                    )}
                    <div className="h-12"></div>
                    {buyableShares.length === 0 ? (
                        <div className="text-center text-2xl mt-4">
                            <span>No shares available for purchase</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => handlePurchaseShare()}
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 border border-white transition duration-300"
                        >
                            Purchase a Share
                        </button>
                    )}
                </div>
            )}
            <div className="h-24"></div>
            <Accordion type="single" collapsible className="w-1/2 mx-auto">
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <p className="text-white">What is a Ticket3 Share?</p>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-white">
                            A Ticket3 Share represents a fractional ownership in
                            the Ticket3 platform. By purchasing a share, you are
                            essentially investing in the platform and its future
                            success. Each share entitles you to a portion of the
                            revenue generated from ticket sales on the platform.
                            The more shares you own, the larger your share of
                            the revenue. Additionally, owning shares gives you a
                            stake in the decision-making process of the
                            platform, allowing you to vote on important issues
                            and help shape the future direction of Ticket3.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>
                        <p className="text-white">What do Ticket3 Shares Do?</p>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-white">
                            Ticket3 Shares allow you to fund the creators of the
                            platform and events while also earning a small
                            percentage of EVERY ticket purchase, based on how
                            many shares you own. It's like a rewards program
                            where your support for the platform and events is
                            recognized and rewarded.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>
                        <p className="text-white">
                            How long does it take my shares to be logged in the
                            Ticket3 System?
                        </p>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-white">
                            It takes roughly a day for your shares to be logged
                            in the Ticket3 System, depending on when the
                            platform is able to update the shares.
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};
export default PurchaseShares;
