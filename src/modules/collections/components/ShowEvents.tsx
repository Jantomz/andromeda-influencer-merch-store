"use client";
import React, { FC, useEffect, useState } from "react";
import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface ShowEventsProps {
    CW721Address: string;
}
const ShowEvents: FC<ShowEventsProps> = (props) => {
    const { toast } = useToast();
    const { CW721Address } = props;
    const client = useAndromedaClient();
    interface Token {
        token_id: string;
        owner: string;
        metadata: {
            name: string;
            description: string;
            image: string;
            attributes: {
                display_type?: string;
                trait_type?: string;
                value: string;
            }[];
        };
    }

    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

    const query = useQueryContract(CW721Address);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let tempTokenList = [];
            if (!client || !query) {
                setLoading(false);
                return;
            }
            try {
                const tokens = await query({ all_tokens: { limit: 9999 } });

                const tokenList = tokens.tokens;

                for (let i = 0; i < tokenList.length; i++) {
                    const token = await query({
                        all_nft_info: {
                            token_id: tokenList[i],
                        },
                    });

                    const response = await fetch(token.info.token_uri);

                    const metadata = await response.json();

                    const hasValidEndDate = metadata.attributes.some(
                        (attribute: any) =>
                            attribute.trait_type === "endDate" &&
                            new Date(attribute.value) >= new Date()
                    );

                    if (hasValidEndDate) {
                        const tokenData = {
                            token_id: tokenList[i],
                            owner: token.access.owner,
                            metadata: metadata,
                        };

                        tempTokenList.push(tokenData);
                    }
                }

                setTokens(tempTokenList);
                setFilteredTokens(tempTokenList);
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
                        <div className="w-full mb-4">
                            <input
                                type="text"
                                placeholder="Search events by name"
                                className="w-full p-2 rounded-md border border-gray-300 bg-black text-white"
                                onChange={(e) => {
                                    const searchTerm =
                                        e.target.value.toLowerCase();
                                    setFilteredTokens(
                                        tokens.filter((token) =>
                                            token.metadata.name
                                                .toLowerCase()
                                                .includes(searchTerm)
                                        )
                                    );
                                }}
                            />
                        </div>
                        {filteredTokens.length === 0 && (
                            <div className="text-center text-2xl mt-4 text-white">
                                No events found
                            </div>
                        )}
                        {filteredTokens.map((token, index) => (
                            <Link
                                key={index}
                                href={`/events/${token.token_id}`}
                            >
                                <Card className="max-w-sm overflow-hidden shadow-lg my-4 p-4 bg-black hover-bg-gray-800">
                                    <CardHeader>
                                        <img
                                            className="w-full h-48 object-cover rounded-md"
                                            src={token.metadata.image}
                                            alt={token.metadata.name}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "https://betterstudio.com/wp-content/uploads/2019/05/1-1-instagram-1024x1024.jpg";
                                            }}
                                        />
                                    </CardHeader>
                                    <CardContent>
                                        <CardTitle className="font-bold text-xl mb-2 text-white">
                                            {token.metadata.name}
                                        </CardTitle>
                                        <CardDescription className="text-gray-400 text-base">
                                            {token.metadata.description}
                                        </CardDescription>
                                        {token.metadata.attributes.map(
                                            (attribute: any, index: number) =>
                                                typeof attribute.value ===
                                                    "string" && (
                                                    <div
                                                        key={index}
                                                        className="text-gray-400 mr-2"
                                                    >
                                                        <span className="font-semibold text-white">
                                                            {
                                                                attribute.display_type
                                                            }
                                                        </span>
                                                        : {attribute.value}
                                                    </div>
                                                )
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};
export default ShowEvents;
