"use client";

import { useToast } from "@/hooks/use-toast";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { useAndromedaStore } from "@/zustand/andromeda";
import React, { FC } from "react";

interface MakeSharesProps {
    CW721SharesAddress: string;
}

const MakeShares: FC<MakeSharesProps> = (props) => {
    const client = useAndromedaClient; // Initialize Andromeda client
    const { toast } = useToast(); // Initialize toast for notifications
    const { CW721SharesAddress } = props; // Destructure props for easier access
    const execute = useExecuteContract(CW721SharesAddress); // Hook to execute contract
    const simulate = useSimulateExecute(CW721SharesAddress); // Hook to simulate contract execution
    const query = useQueryContract(CW721SharesAddress); // Hook to query contract

    const { accounts } = useAndromedaStore(); // Get accounts from Andromeda store
    const account = accounts[0]; // Use the first account
    const userAddress = account?.address ?? ""; // Fallback to empty string if no address

    const handleMintShares = async () => {
        if (!client || !userAddress) {
            return; // Early return if client or user address is not available
        }

        const tokens = await query({
            all_tokens: { limit: 9999 }, // Query all tokens with a limit
        });

        if (tokens.tokens.length > 0) {
            toast({
                title: "Shares already minted",
                description: "Shares have already been minted",
                duration: 5000,
                variant: "destructive",
            });
            return; // Early return if shares are already minted
        }

        const batchSize = 100; // Define batch size for minting
        for (let batchStart = 0; batchStart < 100; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, 100); // Calculate batch end
            const batchTokens = Array.from({
                length: batchEnd - batchStart,
            }).map((_, i) => ({
                token_id: `org-share-${batchStart + i}`, // Generate token ID
                extension: {
                    publisher: "Ticket3", // Set publisher
                },
                owner: userAddress, // Set owner to user address
                token_uri: "", // Empty token URI
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
                        amount: "500000", // Set amount for simulation
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
                            amount: result.amount[0].amount, // Use simulated amount
                        },
                    ],
                    gas: result.gas, // Use simulated gas value
                }
            );

            toast({
                title: "Shares minted",
                description: "Shares have been minted",
                duration: 5000,
            });

            if (typeof window !== "undefined") {
                window.location.reload(); // Reload the page to reflect changes
            }
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
