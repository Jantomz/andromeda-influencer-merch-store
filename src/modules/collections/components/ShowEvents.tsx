"use client";
import React, { FC, useEffect, useState } from "react";
import { useQueryContract } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import Link from "next/link";

interface ShowEventsProps {
    CW721Address: string;
}
const ShowEvents: FC<ShowEventsProps> = (props) => {
    const { CW721Address } = props;
    const client = useAndromedaClient();
    // TODO: Fix any
    const [tokens, setTokens] = useState<any[]>([]);

    const query = useQueryContract(CW721Address);

    useEffect(() => {
        const fetchData = async () => {
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
            } catch (error) {
                console.error("Error querying contract:", error);
            }
        };

        fetchData();
    }, [query, client]);

    return (
        <>
            <div className="flex flex-wrap justify-center gap-4">
                {tokens.length === 0 && (
                    <div className="text-center text-2xl mt-4">
                        No events found
                    </div>
                )}
                {tokens.map((token, index) => (
                    <Link key={index} href={`/events/${token.token_id}`}>
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
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};
export default ShowEvents;
