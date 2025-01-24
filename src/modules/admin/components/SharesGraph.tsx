"use client"; // This directive indicates that this component should be rendered on the client side.

import * as React from "react";
import { Label, Pie, PieChart, Cell } from "recharts"; // Importing necessary components from recharts for creating the pie chart.

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // Importing UI components for consistent styling.
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"; // Importing chart-related components for better modularity.

interface SharesGraphProps {
    data: any; // Defining the type for the data prop to ensure type safety.
}

const chartConfig = {
    value: {
        label: "Value",
    },
    name: {
        label: "Name",
    },
} as ChartConfig; // Configuring chart labels for better readability.

const COLORS = ["#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"]; // Defining a color palette for the pie chart slices.

const SharesGraph: React.FC<SharesGraphProps> = ({ data }) => {
    const totalShareholders = React.useMemo(() => {
        return data.length; // Using useMemo to optimize performance by memoizing the total shareholders calculation.
    }, [data]);

    return (
        <Card className="flex flex-col bg-gray-900 text-white">
            {" "}
            {/* Using Tailwind CSS classes for styling */}
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-white">
                    Shares Distribution {/* Title for the card */}
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Current Shares Data{" "}
                    {/* Description for additional context */}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]" // Ensuring the chart container maintains a square aspect ratio.
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />} // Customizing tooltip content for better user experience.
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60} // Setting inner radius to create a donut chart effect.
                            strokeWidth={5} // Defining stroke width for better visual separation.
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]} // Cycling through colors for each pie slice.
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
                                                    {totalShareholders.toLocaleString()}{" "}
                                                    {/* Displaying total shareholders in the center */}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-gray-400"
                                                >
                                                    Shareholders{" "}
                                                    {/* Label for the total shareholders */}
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
                    Showing total shareholders distribution{" "}
                    {/* Footer text for additional context */}
                </div>
            </CardFooter>
        </Card>
    );
};

export default SharesGraph; // Exporting the component for use in other parts of the application.
