"use client";
import React, { FC, useEffect, useState } from "react";
import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import Link from "next/link";
import { useAndromedaStore } from "@/zustand/andromeda";

interface ShowTicketsProps {
    CW721TicketAddress: string;
}
const ShowTickets: FC<ShowTicketsProps> = (props) => {
    const { CW721TicketAddress } = props;
    const client = useAndromedaClient();
    // TODO: Fix any
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const address = account?.address ?? "";

    const baseURL = window.location.origin;

    const query = useQueryContract(CW721TicketAddress);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let tempTokenList = [];
            if (!client || !query) {
                return;
            }
            try {
                const tokens = await query({ all_tokens: {} });

                console.log(tokens);

                const tokenList = tokens.tokens;

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

                    console.log(tokenData);
                    tempTokenList.push(tokenData);
                }

                setTokens(tempTokenList);
                setLoading(false);
            } catch (error) {
                console.error("Error querying contract:", error);
            }
        };

        fetchData();
    }, [query, client]);

    return (
        <>
            <div className="flex flex-wrap justify-center gap-4">
                {loading ? (
                    <div className="text-center text-2xl mt-4">
                        <div className="flex justify-center items-center space-x-2">
                            <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                            <span>Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {tokens.length === 0 && (
                            <div className="text-center text-2xl mt-4">
                                No tickets found
                            </div>
                        )}
                        {tokens.map((token, index) => (
                            <div className="max-w-sm rounded overflow-hidden shadow-lg my-4 p-4 bg-white">
                                <img
                                    className="w-full h-48 object-cover rounded-md"
                                    src={token.metadata.image}
                                    alt={token.metadata.name}
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "https://betterstudio.com/wp-content/uploads/2019/05/1-1-instagram-1024x1024.jpg";
                                    }}
                                />
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">
                                        {token.metadata.name}
                                    </div>
                                    <p className="text-gray-700 text-base">
                                        {token.metadata.description}
                                    </p>
                                </div>
                                {/* <div className="px-6 py-4">
                                <p className="text-gray-600 text-sm">
                                    Token ID: {token.token_id}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Owner: {token.owner}
                                </p>
                            </div> */}
                                {token.metadata.attributes.map(
                                    (attribute: any, index: number) =>
                                        typeof attribute.value === "string" && (
                                            <div
                                                key={index}
                                                className="px-6 text-gray-700 mr-2"
                                            >
                                                <span className="font-semibold">
                                                    {attribute.display_type}
                                                </span>
                                                : {attribute.value}
                                            </div>
                                        )
                                )}
                                <h1 className="text-2xl font-bold">QR Code</h1>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${baseURL}/approve/${token.token_id}`}
                                    alt="QR Code"
                                />
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};
export default ShowTickets;
