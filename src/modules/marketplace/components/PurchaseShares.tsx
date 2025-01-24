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
    // TODO: Fix any
    const [loading, setLoading] = useState(true);
    const [sharesProcessed, setSharesProcessed] = useState(0);
    const [sharesLength, setSharesLength] = useState(0);

    const queryShares = useQueryContract(CW721SharesAddress);
    const simulatePurchase = useSimulateExecute(MarketplaceAddress);
    const executePurchase = useExecuteContract(MarketplaceAddress);

    const fetchData = async () => {
        setLoading(true);
        if (!client || !queryShares) {
            return;
        }
        try {
            setSharesProcessed(0);
            const tokens = await queryShares({
                all_tokens: {
                    limit: 200,
                },
            });
            setSharesLength(tokens.tokens.length);

            let tempSharesList = [];

            const tokenList = tokens.tokens;

            console.log("TokenList:", tokenList);

            let count = 0;

            for (const token of tokenList) {
                console.log("Token:", token);
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
        if (!client) {
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

            console.log("Purchase ticket simulation result:", result);

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
                <div className="text-center text-2xl mt-4">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                        <span>Loading Shares...</span>
                        <br></br>
                        {sharesProcessed > 0 && sharesLength > 0 && (
                            <Progress
                                value={sharesProcessed}
                                max={sharesLength}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center mt-4">
                    <div className="text-xl mb-2">
                        {buyableShares.length} / 100 shares available for
                        purchase
                    </div>
                    {buyableShares.length === 0 ? (
                        <div className="text-center text-2xl mt-4">
                            <span>No shares available for purchase</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => handlePurchaseShare()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                        >
                            Purchase Share
                        </button>
                    )}
                </div>
            )}
        </>
    );
};
export default PurchaseShares;
