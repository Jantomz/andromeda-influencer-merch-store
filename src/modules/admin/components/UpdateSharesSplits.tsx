"use client";

import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { SharesGraph } from "@/modules/admin";
import { useAndromedaStore } from "@/zustand/andromeda";
import React, { FC, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UpdateSharesSplitsProps {
    SplitterAddress: string;
    CW721SharesAddress: string;
    MarketplaceAddress: string;
    OwnerAddress: string;
}

const UpdateSharesSplits: FC<UpdateSharesSplitsProps> = (props) => {
    const { toast } = useToast();

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

    const [graphData, setGraphData] = useState<any[]>([]);

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

        try {
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

            const graphData = currentConfig.map(
                (recipient: {
                    recipient: { address: string };
                    percent: string;
                }) => ({
                    name:
                        recipient.recipient.address.slice(0, 6) +
                        "......" +
                        recipient.recipient.address.slice(
                            recipient.recipient.address.length - 4
                        ),
                    value: parseFloat(recipient.percent),
                })
            );
            setGraphData(graphData);

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
            setSharesLength(0);
            setSharesProcessed(0);
            toast({
                title: "Shares Loaded",
                description: "Shares update-ability has been checked",
                duration: 5000,
            });
        } catch (error) {
            toast({
                title: "Error getting shares",
                description: "There was an error getting shares",
                duration: 5000,
                variant: "destructive",
            });

            console.error("Error querying contract:", error);
            setLoading(false);
        }
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
        setSharesUpdated(true);
        setLoading(false);
        toast({
            title: "Shares Splits Updated",
            description: "Shares splits have been updated",
            duration: 5000,
        });
    };

    return (
        <div className="flex flex-col items-center justify-center p-6  ">
            {loading ? (
                <div className="text-center text-2xl mt-4 text-white">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                        <span>Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-semibold text-white m-4">
                        Update Shares Splits
                    </h1>
                    <SharesGraph data={graphData} />
                    {sharesUpdated && (
                        <p className="text-lg font-semibold m-2 text-gray-400">
                            Shares are up to date
                        </p>
                    )}
                    {!sharesUpdated && (
                        <>
                            <p className="text-lg font-semibold m-2 text-red-400">
                                Shares need updating
                            </p>
                            <button
                                onClick={() => handleUpdateSharesSplits()}
                                disabled={sharesUpdated}
                                className={` px-5 py-2.5 rounded-lg text-white text-sm transition-colors duration-300
                                bg-red-400 hover:bg-red-600`}
                            >
                                Update share splits
                            </button>
                        </>
                    )}
                </>
            )}
            {sharesLength > 0 && (
                <p className="mt-4 text-lg text-gray-700">
                    Shares Processed: {sharesProcessed}/{sharesLength}
                </p>
            )}
        </div>
    );
};

export default UpdateSharesSplits;
