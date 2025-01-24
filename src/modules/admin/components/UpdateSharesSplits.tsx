"use client";

import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { MakeEvent } from "@/modules/admin";
import Layout from "@/modules/general/components/Layout";
import { useAndromedaStore } from "@/zustand/andromeda";
import React, { FC, useEffect, useState } from "react";

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
    const client = useAndromedaClient();

    const executeSplitter = useExecuteContract(SplitterAddress);
    const simulateSplitter = useSimulateExecute(SplitterAddress);
    const queryShares = useQueryContract(CW721SharesAddress);
    const querySplitter = useQueryContract(SplitterAddress);

    const [sharesProcessed, setSharesProcessed] = useState(0);
    const [sharesLength, setSharesLength] = useState(0);
    const [sharesUpdated, setSharesUpdated] = useState(true);
    const [loading, setLoading] = useState(true);

    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const userAddress = account?.address ?? "";

    const handleCheckSharesDisparity = async () => {
        setLoading(true);
        // TODO: Do these checks for all the functions
        const shares = await queryShares({
            all_tokens: {
                limit: 100,
            },
        });
        setSharesLength(shares.tokens.length);

        let tempSharesList = [];

        let count = 0;

        for (const token of shares.tokens) {
            const shareInfo = await queryShares({
                all_nft_info: {
                    token_id: token,
                },
            });

            tempSharesList.push(shareInfo);
            count += 1;
            setSharesProcessed(count);
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
                    msg: null,
                    ibc_recovery_address: null,
                },
                percent: (count / totalShares).toFixed(2),
            })
        );

        const splitterConfig = await querySplitter({
            get_splitter_config: {},
        });

        console.log(updatedRecipients);
        console.log(splitterConfig.config.recipients);
        const currentConfig = splitterConfig.config.recipients;
        const correctConfig = updatedRecipients;

        console.log(JSON.stringify(currentConfig));
        console.log(JSON.stringify(correctConfig));

        const isConfigSame =
            JSON.stringify(currentConfig) === JSON.stringify(correctConfig);
        console.log(isConfigSame);
        if (!isConfigSame) {
            setSharesUpdated(false);
        } else {
            setSharesUpdated(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!client) {
            return () => {
                setSharesLength(0);
                setSharesProcessed(0);
            };
        }

        let isMounted = true;

        const handleEffect = async () => {
            if (isMounted) {
                await handleCheckSharesDisparity();
            }
        };

        handleEffect();

        return () => {
            isMounted = false;
            setSharesLength(0);
            setSharesProcessed(0);
        };
    }, [client]);

    const handleUpdateSharesSplits = async () => {
        if (!queryShares || !querySplitter || !client) {
            return;
        }

        setLoading(true);
        setSharesProcessed(0);
        const shares = await queryShares({
            all_tokens: {
                limit: 100,
            },
        });
        setSharesLength(shares.tokens.length);

        let tempSharesList = [];

        for (const token of shares.tokens) {
            const shareInfo = await queryShares({
                all_nft_info: {
                    token_id: token,
                },
            });
            console.log(shareInfo);

            tempSharesList.push(shareInfo);
            setSharesProcessed((prev) => prev + 1);
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
        // TODO: When this fails or gets cancelled, handle
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

        setSharesLength(0);
        setSharesProcessed(0);
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 border rounded shadow-md">
            {loading ? (
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 rounded-full animate-spin border-2 border-t-2 border-gray-200 border-t-blue-500"></div>
                    <div className="text-lg font-medium text-gray-700">
                        Loading...
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => handleUpdateSharesSplits()}
                    className={`px-4 py-2 rounded text-white ${
                        sharesUpdated
                            ? "bg-green-500 hover:bg-green-700"
                            : "bg-red-500 hover:bg-red-700"
                    }`}
                >
                    {sharesUpdated
                        ? "Shares are Up-to-date"
                        : "Update Share Splits"}
                </button>
            )}
            {sharesLength > 0 && (
                <p className="mt-4 text-lg">
                    Shares Processed: {sharesProcessed}/{sharesLength}
                </p>
            )}
        </div>
    );
};

export default UpdateSharesSplits;
