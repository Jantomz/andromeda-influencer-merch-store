"use client";
import React, { FC, useEffect, useState } from "react";
import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { useToast } from "@/hooks/use-toast";
import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface ShowEventStatsProps {
    CW721Address: string;
}

const chartConfig = {
    visitors: {
        label: "Events",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

const ShowEventStats: FC<ShowEventStatsProps> = (props) => {
    const { toast } = useToast();
    const { CW721Address } = props;
    const client = useAndromedaClient();
    type ChartData = {
        browser: string;
        events: string;
        fill: string;
    };
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    const query = useQueryContract(CW721Address);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (!client || !query) {
                setLoading(false);
                return;
            }
            try {
                const tokens = await query({ all_tokens: {} });

                const tokenList = tokens.tokens;
                setChartData([
                    {
                        browser: "safari",
                        events: tokenList.length.toString(),
                        fill: "var(--color-safari)",
                    },
                ]);

                setLoading(false);
            } catch (error) {
                toast({
                    title: "Error getting events",
                    description: "There was an error getting events",
                    duration: 5000,
                    variant: "destructive",
                });
                setLoading(false);

                console.error("Error querying contract:", error);
            }
        };

        fetchData();
    }, [query, client]);

    return (
        <>
            <div className="flex flex-wrap justify-center gap-4">
                {loading ? (
                    <div className="text-center text-2xl mt-4 text-white">
                        <div className="flex justify-center items-center space-x-2">
                            <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                            <span>Loading...</span>
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
                                        {chartData[0]?.events}
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
