"use client";

import { useToast } from "@/hooks/use-toast";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { MakeEvent } from "@/modules/admin";
import Layout from "@/modules/general/components/Layout";
import { useAndromedaStore } from "@/zustand/andromeda";
import React, { FC } from "react";

interface MakeSharesProps {
    CW721SharesAddress: string;
}

const MakeShares: FC<MakeSharesProps> = (props) => {
    const client = useAndromedaClient;
    const { toast } = useToast();
    const { CW721SharesAddress } = props;
    const execute = useExecuteContract(CW721SharesAddress);
    const simulate = useSimulateExecute(CW721SharesAddress);
    const query = useQueryContract(CW721SharesAddress);

    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const userAddress = account?.address ?? "";

    const handleMintShares = async () => {
        if (!client || !userAddress) {
            return;
        }

        const tokens = await query({
            all_tokens: {},
        });

        if (tokens.tokens.length > 0) {
            toast({
                title: "Shares already minted",
                description: "Shares have already been minted",
                duration: 5000,
                variant: "destructive",
            });
            return;
        }

        const batchSize = 100;
        for (let batchStart = 0; batchStart < 100; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, 100);
            const batchTokens = Array.from({
                length: batchEnd - batchStart,
            }).map((_, i) => ({
                token_id: `org-share-${batchStart + i}`,
                extension: {
                    publisher: "Ticket3",
                },
                owner: userAddress, // Replace with actual user address
                token_uri: "",
            }));

            const result = await simulate(
                {
                    batch_mint: {
                        tokens: batchTokens,
                    },
                },
                [
                    {
                        denom: "uandr",
                        amount: "500000",
                    },
                ]
            );

            await execute(
                {
                    batch_mint: {
                        tokens: batchTokens,
                    },
                },
                {
                    amount: [
                        {
                            denom: result.amount[0].denom,
                            amount: result.amount[0].amount,
                        },
                    ],
                    gas: result.gas, // Replace with actual gas value if needed
                }
            );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
            <button
                onClick={() => handleMintShares()}
                className="px-6 py-3 mt-5 text-white bg-black border border-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                Mint 100 Shares
            </button>
            <p className="text-xs font-thin text-gray-300">
                You can only make shares if there are no shares minted!
            </p>
        </div>
    );
};

export default MakeShares;
