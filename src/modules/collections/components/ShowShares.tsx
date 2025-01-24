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
    const { toast } = useToast(); // Using toast for error notifications
    const { SplitterAddress } = props;
    const client = useAndromedaClient(); // Initialize Andromeda client

    const querySplitter = useQueryContract(SplitterAddress); // Query contract with SplitterAddress

    const [graphData, setGraphData] = useState<any[]>([]); // State to hold graph data

    const [loading, setLoading] = useState(true); // State to manage loading status

    const handleCheckSharesDisparity = async () => {
        setLoading(true); // Set loading to true before fetching data

        if (!client || !querySplitter) {
            setLoading(false); // Stop loading if client or querySplitter is not available
            return;
        }

        try {
            const splitterConfig = await querySplitter({
                get_splitter_config: {},
            }); // Fetch splitter configuration

            const currentConfig = splitterConfig.config.recipients; // Extract recipients from config

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
                        ), // Shorten address for display
                    value: parseFloat(recipient.percent), // Convert percent to float
                })
            );
            setGraphData(graphData); // Update graph data state

            setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
            toast({
                title: "Error getting shares",
                description: "There was an error getting shares",
                duration: 5000,
                variant: "destructive",
            }); // Show error toast notification
            setLoading(false); // Set loading to false if there's an error

            console.error("Error querying contract:", error); // Log error to console
        }
    };

    useEffect(() => {
        if (!client) {
            return;
        }

        let isMounted = true; // Track if component is mounted

        const handleEffect = async () => {
            if (isMounted) {
                await handleCheckSharesDisparity(); // Fetch data if component is mounted
            }
        };

        handleEffect();

        return () => {
            isMounted = false; // Cleanup function to set isMounted to false
        };
    }, [client]); // Dependency array to re-run effect when client changes

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
