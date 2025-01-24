"use client";
import React, { FC, useEffect, useState } from "react";
import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import Link from "next/link";
import { useAndromedaStore } from "@/zustand/andromeda";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface ShowTicketsProps {
    CW721TicketAddress: string;
    CW721POAAddress: string;
}
const ShowTickets: FC<ShowTicketsProps> = (props) => {
    const { toast } = useToast();
    const { CW721TicketAddress, CW721POAAddress } = props;
    const client = useAndromedaClient();
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const address = account?.address ?? "";

    const baseURL = typeof window !== "undefined" ? window.location.origin : "";

    const query = useQueryContract(CW721TicketAddress);
    const queryPOA = useQueryContract(CW721POAAddress);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let tempTokenList = [];
            if (!client || !query) {
                setLoading(false);
                return;
            }
            try {
                const tokens = await query({ all_tokens: {} });

                const approvedTokens = await queryPOA({ all_tokens: {} });

                const tokenList = tokens.tokens;
                const approvedTokenList = approvedTokens.tokens;

                for (let i = 0; i < tokenList.length; i++) {
                    const token = await query({
                        all_nft_info: {
                            token_id: tokenList[i],
                        },
                    });

                    if (token.access.owner !== address) {
                        continue;
                    }

                    const response = await fetch(token.info.token_uri);

                    const metadata = await response.json();

                    const tokenData = {
                        token_id: tokenList[i],
                        owner: token.access.owner,
                        metadata: metadata,
                    };

                    tempTokenList.push(tokenData);
                }

                for (let i = 0; i < approvedTokenList.length; i++) {
                    const token = await queryPOA({
                        all_nft_info: {
                            token_id: approvedTokenList[i],
                        },
                    });

                    if (token.access.owner !== address) {
                        continue;
                    }

                    const tokenData = {
                        token_id: approvedTokenList[i],
                        owner: token.access.owner,
                    };

                    const existingTokenIndex = tempTokenList.findIndex(
                        (t) => t.token_id + "-approved" === approvedTokenList[i]
                    );

                    if (existingTokenIndex !== -1) {
                        tempTokenList[
                            existingTokenIndex
                        ].metadata.attributes.push({
                            display_type: "Proof of Attendance",
                            trait_type: "proof-of-attendance",
                            value: "Approved Attendance",
                        });
                    }
                }

                setTokens(tempTokenList);
                setLoading(false);
            } catch (error) {
                toast({
                    title: "Error getting tickets",
                    description: "There was an error getting tickets",
                    duration: 5000,
                    variant: "destructive",
                });
                setLoading(false);

                console.error("Error querying contract:", error);
            }
        };

        fetchData();
    }, [query, client]);

    const getAttributeValue = (attributes: any[], traitType: string) => {
        const attribute = attributes.find(
            (attr) => attr.trait_type === traitType
        );
        return attribute ? attribute.value : null;
    };

    const categorizeTokens = (tokens: any[]) => {
        const now = new Date();
        const pastEvents = tokens.filter(
            (token) =>
                new Date(
                    getAttributeValue(token.metadata.attributes, "dateEnd")
                ) < now
        );
        const currentEvents = tokens.filter(
            (token) =>
                new Date(
                    getAttributeValue(token.metadata.attributes, "dateStart")
                ) <= now &&
                new Date(
                    getAttributeValue(token.metadata.attributes, "dateEnd")
                ) >= now
        );
        const upcomingEvents = tokens.filter(
            (token) =>
                new Date(
                    getAttributeValue(token.metadata.attributes, "dateStart")
                ) > now
        );

        return { pastEvents, currentEvents, upcomingEvents };
    };

    const { pastEvents, currentEvents, upcomingEvents } =
        categorizeTokens(tokens);

    const renderTokens = (tokens: any[], title: string) => (
        <>
            <h2 className="text-2xl text-white mt-4">{title}</h2>
            <div className="flex flex-wrap justify-center gap-4">
                {tokens.length === 0 ? (
                    <div className="text-center text-2xl mt-4 text-white">
                        No {title.toLowerCase()} found
                    </div>
                ) : (
                    tokens.map((token, index) => (
                        <Card
                            className="max-w-sm rounded overflow-hidden shadow-lg my-4 p-4 bg-black border border-white"
                            key={index}
                        >
                            <CardHeader>
                                <img
                                    className="w-full h-48 object-cover rounded-md"
                                    src={token.metadata.image}
                                    alt={token.metadata.name}
                                />
                                <CardTitle className="font-bold text-xl mb-2 text-white">
                                    {token.metadata.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-300 text-base">
                                    {token.metadata.description}
                                </CardDescription>
                                <br></br>
                                {token.metadata.attributes.map(
                                    (attribute: any, index: number) =>
                                        typeof attribute.value === "string" && (
                                            <div
                                                key={index}
                                                className="px-6 text-gray-300 mr-2"
                                            >
                                                <span className="font-semibold text-white">
                                                    {attribute.display_type}
                                                </span>
                                                : {attribute.value}
                                            </div>
                                        )
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${baseURL}/admin/${token.token_id}/approve`}
                                    alt="QR Code"
                                />
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </>
    );

    return (
        <>
            {loading ? (
                <div className="text-center text-2xl mt-4 text-white">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                        <span>Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {renderTokens(currentEvents, "Current Events")}
                    {renderTokens(upcomingEvents, "Upcoming Events")}
                    {renderTokens(pastEvents, "Past Events")}
                </>
            )}
        </>
    );
};
export default ShowTickets;
