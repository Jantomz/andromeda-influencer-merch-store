"use client";

import { useExecuteContract, useSimulateExecute } from "@/lib/andrjs";
import { MakeEvent } from "@/modules/admin";
import Layout from "@/modules/general/components/Layout";
import { useAndromedaStore } from "@/zustand/andromeda";
import React, { FC } from "react";

interface MakeSharesProps {}

const MakeShares: FC<MakeSharesProps> = (props) => {
    const execute = useExecuteContract(
        "andr1qhndf3kcpqxqxc33p042wae6d95svr5an292wt765n8jxq2wccgq0vyldt"
    );
    const simulate = useSimulateExecute(
        "andr1qhndf3kcpqxqxc33p042wae6d95svr5an292wt765n8jxq2wccgq0vyldt"
    );

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

    //     update_recipients
    // :
    // recipients
    // :
    // Array(2)
    // 0
    // :
    // percent
    // :
    // "0.8"
    // recipient
    // :
    // {address: 'andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx', ibc_recovery_address: null, msg: null}
    // [[Prototype]]
    // :
    // Object
    // 1
    // :
    // percent
    // :
    // "0.2"
    // recipient
    // :
    // {address: 'andr1zgs0kv5snpfrt7d63nau6lu59aevmkhpyw06d
    return (
        <main>
            <button onClick={() => handleMintShares()}>Mint Shares</button>
        </main>
    );
};

export default MakeShares;
