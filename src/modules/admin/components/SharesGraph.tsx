"use client";

import * as React from "react";
import { Label, Pie, PieChart, Cell } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface SharesGraphProps {
    data: any;
}

const chartConfig = {
    value: {
        label: "Value",
    },
    name: {
        label: "Name",
    },
} as ChartConfig;

const COLORS = ["#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"];

const SharesGraph: React.FC<SharesGraphProps> = ({ data }) => {
    const totalShareholders = React.useMemo(() => {
        return data.length;
    }, [data]);

    return (
        <Card className="flex flex-col bg-gray-900 text-white">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-white">
                    Shares Distribution
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Current Shares Data
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        "cx" in viewBox &&
                                        "cy" in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-white text-3xl font-bold"
                                                >
                                                    {totalShareholders.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-gray-400"
                                                >
                                                    Shareholders
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="leading-none text-gray-400">
                    Showing total shareholders distribution
                </div>
            </CardFooter>
        </Card>
    );
};

export default SharesGraph;
