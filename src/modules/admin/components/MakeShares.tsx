"use client";

import { useExecuteContract, useSimulateExecute } from "@/lib/andrjs";
import { MakeEvent } from "@/modules/admin";
import Layout from "@/modules/general/components/Layout";
import { useAndromedaStore } from "@/zustand/andromeda";
import React, { FC } from "react";

interface MakeSharesProps {
    CW721SharesAddress: string;
}

const MakeShares: FC<MakeSharesProps> = (props) => {
    const { CW721SharesAddress } = props;
    const execute = useExecuteContract(CW721SharesAddress);
    const simulate = useSimulateExecute(CW721SharesAddress);

    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const userAddress = account?.address ?? "";

    const handleMintShares = async () => {
        const batchSize = 100;
        for (let batchStart = 0; batchStart < 100; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, 100);
            const batchTokens = Array.from({
                length: batchEnd - batchStart,
            }).map((_, i) => ({
                token_id: `org-share-${batchStart + i}`,
                extension: {
                    publisher: "App Developer",
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
        <main>
            <button onClick={() => handleMintShares()}>Mint Shares</button>
        </main>
    );
};

export default MakeShares;
