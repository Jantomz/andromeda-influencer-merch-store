"use client";

import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import { MakeEvent } from "@/modules/admin";
import Layout from "@/modules/general/components/Layout";
import { useAndromedaStore } from "@/zustand/andromeda";
import React, { FC } from "react";

interface UpdateSharesSplitsProps {
    SplitterAddress: string;
    CW721SharesAddress: string;
    MarketplaceAddress: string;
    OwnerAddress: string;
}

const UpdateSharesSplits: FC<UpdateSharesSplitsProps> = (props) => {
    const {
        SplitterAddress,
        CW721SharesAddress,
        MarketplaceAddress,
        OwnerAddress,
    } = props;
    const executeSplitter = useExecuteContract(SplitterAddress);
    const simulateSplitter = useSimulateExecute(SplitterAddress);
    const queryShares = useQueryContract(CW721SharesAddress);

    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const userAddress = account?.address ?? "";

    const handleUpdateSharesSplits = async () => {
        const shares = await queryShares({
            all_tokens: {
                limit: 200,
            },
        });

        let tempSharesList = [];

        for (const token of shares.tokens) {
            const shareInfo = await queryShares({
                all_nft_info: {
                    token_id: token,
                },
            });
            console.log(shareInfo);

            tempSharesList.push(shareInfo);
        }

        const sharesCount: { [address: string]: number } = {};

        for (const share of tempSharesList) {
            let ownerAddress = share.access.owner;
            if (ownerAddress === MarketplaceAddress) {
                ownerAddress = OwnerAddress;
            }
            if (sharesCount[ownerAddress]) {
                sharesCount[ownerAddress] += 1;
            } else {
                sharesCount[ownerAddress] = 1;
            }
        }
        const totalShares = Object.values(sharesCount).reduce(
            (a, b) => a + b,
            0
        );

        const updatedRecipients = Object.entries(sharesCount).map(
            ([address, count]) => ({
                recipient: {
                    address,
                    ibc_recovery_address: null,
                    msg: null,
                },
                percent: (count / totalShares).toFixed(2),
            })
        );

        console.log(updatedRecipients);

        const result = await simulateSplitter(
            {
                update_recipients: {
                    recipients: updatedRecipients,
                },
            },
            []
        );

        console.log(result);

        await executeSplitter(
            {
                update_recipients: {
                    recipients: updatedRecipients,
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
            }
        );
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
            <button onClick={() => handleUpdateSharesSplits()}>
                Update Share Splits
            </button>
        </main>
    );
};

export default UpdateSharesSplits;
