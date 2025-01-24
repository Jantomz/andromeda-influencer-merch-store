"use client";
import React, { FC, useEffect, useState } from "react";
import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface ShowEventStatsProps {
    CW721Address: string; // Prop to receive the contract address
}

const chartConfig = {
    visitors: {
        label: "Events",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
    },
} as ChartConfig; // Configuration for the chart

const ShowEventStats: FC<ShowEventStatsProps> = (props) => {
    const { toast } = useToast(); // Hook to show toast notifications
    const { CW721Address } = props; // Destructure props for easier access
    const client = useAndromedaClient(); // Hook to get the Andromeda client
    type ChartData = {
        browser: string;
        events: string;
        fill: string;
    };
    const [chartData, setChartData] = useState<ChartData[]>([]); // State to store chart data
    const [loading, setLoading] = useState(true); // State to manage loading state

    const query = useQueryContract(CW721Address); // Hook to query the contract

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching data
            if (!client || !query) {
                setLoading(false); // Stop loading if client or query is not available
                return;
            }
            try {
                const tokens = await query({ all_tokens: { limit: 9999 } }); // Query all tokens with a limit

                const tokenList = tokens.tokens; // Extract token list from response
                setChartData([
                    {
                        browser: "safari",
                        events: tokenList.length.toString(), // Convert number of tokens to string
                        fill: "var(--color-safari)", // Set fill color for chart
                    },
                ]);

                setLoading(false); // Set loading to false after data is fetched
            } catch (error) {
                toast({
                    title: "Error getting events",
                    description: "There was an error getting events",
                    duration: 5000,
                    variant: "destructive",
                }); // Show error toast notification
                setLoading(false); // Set loading to false in case of error

                console.error("Error querying contract:", error); // Log error to console
            }
        };

        fetchData(); // Call fetchData function
    }, [query, client]); // Dependencies for useEffect

    return (
        <>
            <div className="flex flex-wrap justify-center gap-4">
                {loading ? (
                    <div className="text-center text-2xl mt-4 text-white">
                        <div className="flex justify-center items-center space-x-2">
                            <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                            <span>Loading...</span> {/* Show loading spinner */}
                        </div>
                    </div>
                ) : (
                    <>
                        {chartData[0]?.events && (
                            <Card className="flex flex-col bg-gray-900 text-white shadow-lg rounded-lg w-[300px] h-[300px]">
                                <CardHeader className="items-center pb-0">
                                    <CardTitle className="text-2xl font-bold">
                                        Event Statistics
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Showing the number of events
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pb-0">
                                    <div className="text-9xl font-semibold m-4 text-center">
                                        {chartData[0]?.events}{" "}
                                        {/* Display number of events */}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </>
    );
};
export default ShowEventStats;
