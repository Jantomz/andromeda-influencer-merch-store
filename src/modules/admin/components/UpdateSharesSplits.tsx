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
    const { toast } = useToast(); // Using custom toast hook for notifications

    const {
        SplitterAddress,
        CW721SharesAddress,
        MarketplaceAddress,
        OwnerAddress,
    } = props;
    const client = useAndromedaClient(); // Initialize Andromeda client

    const executeSplitter = useExecuteContract(SplitterAddress); // Hook to execute contract
    const simulateSplitter = useSimulateExecute(SplitterAddress); // Hook to simulate contract execution
    const queryShares = useQueryContract(CW721SharesAddress); // Hook to query shares contract
    const querySplitter = useQueryContract(SplitterAddress); // Hook to query splitter contract

    const [graphData, setGraphData] = useState<any[]>([]); // State to store graph data

    const [sharesProcessed, setSharesProcessed] = useState(0); // State to track processed shares
    const [sharesLength, setSharesLength] = useState(0); // State to track total shares
    const [sharesUpdated, setSharesUpdated] = useState(true); // State to track if shares are updated
    const [loading, setLoading] = useState(true); // State to track loading status

    const { accounts } = useAndromedaStore(); // Get accounts from store
    const account = accounts[0]; // Get the first account
    const userAddress = account?.address ?? ""; // Get user address or empty string

    const handleCheckSharesDisparity = async () => {
        setLoading(true); // Set loading to true

        if (!queryShares || !querySplitter || !client) {
            setLoading(false); // Stop loading if dependencies are missing
            return;
        }

        const shares = await queryShares({
            all_tokens: {
                limit: 100,
            },
        });
        setSharesLength(shares.tokens.length); // Set total shares length

        let tempSharesList = [];

        let count = 0;

        try {
            for (const token of shares.tokens) {
                const shareInfo = await queryShares({
                    all_nft_info: {
                        token_id: token,
                    },
                });

                tempSharesList.push(shareInfo); // Collect share info
                count += 1;
                setSharesProcessed(count); // Update processed shares count
            }

            const sharesCount: { [address: string]: number } = {};

            for (const share of tempSharesList) {
                let ownerAddress = share.access.owner;
                if (ownerAddress === MarketplaceAddress) {
                    ownerAddress = OwnerAddress; // Replace marketplace address with owner address
                }
                if (sharesCount[ownerAddress]) {
                    sharesCount[ownerAddress] += 1; // Increment share count for address
                } else {
                    sharesCount[ownerAddress] = 1; // Initialize share count for address
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
                    percent: (count / totalShares).toFixed(2), // Calculate percentage
                })
            );

            const splitterConfig = await querySplitter({
                get_splitter_config: {},
            });

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
                    value: parseFloat(recipient.percent), // Format graph data
                })
            );
            setGraphData(graphData); // Set graph data

            const isConfigSame = currentConfig.every(
                (current: any, index: number) => {
                    const correct = correctConfig[index];
                    return (
                        current.recipient.address ===
                            correct.recipient.address &&
                        parseFloat(current.percent) ===
                            parseFloat(correct.percent)
                    );
                }
            );
            console.log(JSON.stringify(currentConfig));
            console.log(JSON.stringify(correctConfig));
            if (!isConfigSame) {
                setSharesUpdated(false); // Set shares updated status
            } else {
                setSharesUpdated(true);
            }
            setLoading(false); // Stop loading
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
            setLoading(false); // Stop loading on error
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
                await handleCheckSharesDisparity(); // Check shares disparity on mount
            }
        };

        handleEffect();

        return () => {
            isMounted = false;
            setSharesLength(0);
            setSharesProcessed(0);
        };
    }, [client]); // Dependency array to re-run effect when client changes

    const handleUpdateSharesSplits = async () => {
        if (!queryShares || !querySplitter || !client) {
            return;
        }

        setLoading(true); // Set loading to true
        setSharesProcessed(0);
        try {
            const shares = await queryShares({
                all_tokens: {
                    limit: 100,
                },
            });
            setSharesLength(shares.tokens.length); // Set total shares length

            let tempSharesList = [];

            for (const token of shares.tokens) {
                const shareInfo = await queryShares({
                    all_nft_info: {
                        token_id: token,
                    },
                });

                tempSharesList.push(shareInfo); // Collect share info
                setSharesProcessed((prev) => prev + 1); // Update processed shares count
            }

            const sharesCount: { [address: string]: number } = {};

            for (const share of tempSharesList) {
                let ownerAddress = share.access.owner;
                if (ownerAddress === MarketplaceAddress) {
                    ownerAddress = OwnerAddress; // Replace marketplace address with owner address
                }
                if (sharesCount[ownerAddress]) {
                    sharesCount[ownerAddress] += 1; // Increment share count for address
                } else {
                    sharesCount[ownerAddress] = 1; // Initialize share count for address
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
                    percent: (count / totalShares).toFixed(2), // Calculate percentage
                })
            );

            const result = await simulateSplitter(
                {
                    update_recipients: {
                        recipients: updatedRecipients,
                    },
                },
                []
            );

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
            setSharesUpdated(true); // Set shares updated status
            setLoading(false); // Stop loading
            toast({
                title: "Shares Splits Updated",
                description: "Shares splits have been updated",
                duration: 5000,
            });
        } catch (error) {
            toast({
                title: "Error updating shares",
                description: "There was an error updating shares",
                duration: 5000,
                variant: "destructive",
            });
            setLoading(false); // Stop loading on error
        }
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
                    <SharesGraph data={graphData} /> {/* Render graph */}
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
