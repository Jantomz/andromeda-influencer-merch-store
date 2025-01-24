"use client";
import React, { FC, useEffect, useState } from "react";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SendSharesProps {
    MarketplaceAddress: string;
    OwnerAddress: string;
    CW721SharesAddress: string;
}
const SendShares: FC<SendSharesProps> = (props) => {
    const { OwnerAddress, MarketplaceAddress, CW721SharesAddress } = props;
    const client = useAndromedaClient();
    const [tokens, setTokens] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);

    const query = useQueryContract(CW721SharesAddress);
    const execute = useExecuteContract(CW721SharesAddress);
    const simulate = useSimulateExecute(CW721SharesAddress);

    const fetchData = async () => {
        setLoading(true);
        if (!client || !query) {
            setLoading(false);
            return;
        }

        const result = await query({
            tokens: { limit: 100, owner: OwnerAddress },
        });

        const tokenList = result.tokens;
        setTokens(tokenList);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [query, client]);

    const jsonToBase64 = (json: any) => {
        return Buffer.from(JSON.stringify(json)).toString("base64");
    };

    const handleSendTicketToMarketplace = async (token_id: string) => {
        setLoading(true);
        if (!client) {
            return;
        }

        const msg = jsonToBase64({
            start_sale: {
                coin_denom: {
                    native_token: "uandr",
                },
                recipient: null,
                start_time: null,
                // Duration is set to nothing so that the organizer can take tickets off when they please, they don't have to continuously do things
                duration: null,
                price: "5000",
            },
        });

        try {
            const result = await simulate(
                {
                    send_nft: {
                        contract: MarketplaceAddress,
                        token_id: token_id,
                        msg: msg,
                    },
                },
                [{ denom: "uandr", amount: "500000" }]
            );

            await execute(
                {
                    send_nft: {
                        contract: MarketplaceAddress,
                        token_id: token_id,
                        msg: msg,
                    },
                },
                {
                    amount: [
                        {
                            denom: result.amount[0].denom,
                            amount: result.amount[0].amount,
                        },
                    ],
                    gas: result.gas,
                }
            );

            fetchData();
            setLoading(false);
        } catch (error) {
            console.error("Error sending ticket to marketplace:", error);
            setLoading(false);
        }
    };

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
                <div>
                    <h1 className="text-2xl text-white font-semibold text-center m-4">
                        Organization Self-Owned Shares
                    </h1>
                    {tokens.length === 0 && (
                        <div className="text-center text-2xl mt-4 text-white">
                            No shares found
                        </div>
                    )}
                    <ScrollArea className="h-[800px] w-full rounded-md border p-4">
                        {tokens.map((token) => (
                            <div key={token} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between bg-black border border-white p-4 rounded-lg shadow-md m-2">
                                    <div>
                                        <div className="text-lg font-bold text-white">
                                            {token}
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() =>
                                                handleSendTicketToMarketplace(
                                                    token
                                                )
                                            }
                                            className="bg-black border-white hover:bg-gray-800 border text-white px-4 py-2 rounded-lg"
                                        >
                                            Send to Marketplace
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            )}
        </>
    );
};
export default SendShares;