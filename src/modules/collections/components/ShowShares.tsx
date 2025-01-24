"use client";

import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { SharesGraph } from "@/modules/admin";
import React, { FC, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShowSharesProps {
    SplitterAddress: string;
}

const ShowShares: FC<ShowSharesProps> = (props) => {
    const { toast } = useToast();
    const { SplitterAddress } = props;
    const client = useAndromedaClient();

    const querySplitter = useQueryContract(SplitterAddress);

    const [graphData, setGraphData] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const handleCheckSharesDisparity = async () => {
        setLoading(true);

        try {
            const splitterConfig = await querySplitter({
                get_splitter_config: {},
            });

            const currentConfig = splitterConfig.config.recipients;

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

            setLoading(false);
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
        if (!client) {
            return;
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
        };
    }, [client]);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-black text-white">
            {loading ? (
                <div className="text-center text-2xl mt-4 text-white">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                        <span>Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <SharesGraph data={graphData} />
                </>
            )}
        </div>
    );
};

export default ShowShares;
