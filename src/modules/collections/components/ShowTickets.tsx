"use client";
import React, { FC, useEffect, useState } from "react";
import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
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
import { OwnerAddress } from "@/ContractAddresses";

interface ShowTicketsProps {
    CW721TicketAddress: string;
    CW721POAAddress: string;
}

const ShowTickets: FC<ShowTicketsProps> = (props) => {
    const { toast } = useToast(); // To display toast notifications
    const { CW721TicketAddress, CW721POAAddress } = props;
    const client = useAndromedaClient(); // Custom hook to get Andromeda client
    const [tokens, setTokens] = useState<any[]>([]); // State to store tokens
    const [loading, setLoading] = useState(true); // State to manage loading state
    const { accounts } = useAndromedaStore(); // Zustand store for accounts
    const account = accounts[0];
    const address = account?.address ?? ""; // Fallback to empty string if no address

    const baseURL = typeof window !== "undefined" ? window.location.origin : ""; // Get base URL for QR code generation

    const query = useQueryContract(CW721TicketAddress); // Query contract for tickets
    const queryPOA = useQueryContract(CW721POAAddress); // Query contract for POA

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading state to true before fetching data
            let tempTokenList = [];
            if (!client || !query) {
                setLoading(false); // Stop loading if client or query is not available
                return;
            }
            try {
                if (address === OwnerAddress) {
                    toast({
                        title: "Error getting tickets",
                        description: "Owner cannot have tickets",
                        duration: 5000,
                        variant: "destructive",
                    });
                    setLoading(false); // Stop loading if the address is the owner
                    return;
                }
                const tokens = await query({ all_tokens: { limit: 9999 } }); // Fetch all tokens

                const approvedTokens = await queryPOA({
                    all_tokens: { limit: 9999 },
                }); // Fetch all approved tokens

                const tokenList = tokens.tokens;
                const approvedTokenList = approvedTokens.tokens;

                for (let i = 0; i < tokenList.length; i++) {
                    const token = await query({
                        all_nft_info: {
                            token_id: tokenList[i],
                        },
                    });

                    if (token.access.owner !== address) {
                        continue; // Skip tokens not owned by the current address
                    }

                    const response = await fetch(token.info.token_uri); // Fetch token metadata

                    const metadata = await response.json();

                    const tokenData = {
                        token_id: tokenList[i],
                        owner: token.access.owner,
                        metadata: metadata,
                    };

                    tempTokenList.push(tokenData); // Add token data to the list
                }

                for (let i = 0; i < approvedTokenList.length; i++) {
                    const token = await queryPOA({
                        all_nft_info: {
                            token_id: approvedTokenList[i],
                        },
                    });

                    if (token.access.owner !== address) {
                        continue; // Skip approved tokens not owned by the current address
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
                        }); // Add POA attribute to existing token
                    }
                }

                setTokens(tempTokenList); // Update state with fetched tokens
                setLoading(false); // Set loading state to false after fetching data
            } catch (error) {
                toast({
                    title: "Error getting tickets",
                    description: "There was an error getting tickets",
                    duration: 5000,
                    variant: "destructive",
                });
                setLoading(false); // Set loading state to false in case of error

                console.error("Error querying contract:", error); // Log error to console
            }
        };

        fetchData(); // Call fetchData function
    }, [query, client]); // Dependency array for useEffect

    const getAttributeValue = (attributes: any[], traitType: string) => {
        const attribute = attributes.find(
            (attr) => attr.trait_type === traitType
        );
        return attribute ? attribute.value : null; // Return attribute value if found
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

        return { pastEvents, currentEvents, upcomingEvents }; // Categorize tokens based on event dates
    };

    const { pastEvents, currentEvents, upcomingEvents } =
        categorizeTokens(tokens); // Destructure categorized tokens

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
                    {renderTokens(currentEvents, "Current Event Tickets")}
                    {renderTokens(upcomingEvents, "Upcoming Event Tickets")}
                    {renderTokens(pastEvents, "Past Event Tickets")}
                </>
            )}
        </>
    );
};
export default ShowTickets;
