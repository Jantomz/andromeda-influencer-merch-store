"use client";
import React, { FC, useEffect, useState } from "react";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAndromedaStore } from "@/zustand/andromeda";

interface ShowEventProps {
    CW721Address: string;
    CW721TicketAddress: string;
    token_id: string;
    MarketplaceAddress: string;
    OwnerAddress: string;
    SplitterAddress: string;
}
const ShowEvent: FC<ShowEventProps> = (props) => {
    const { toast } = useToast();
    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const address = account?.address ?? ""; // Default to empty string if no address

    const {
        CW721Address,
        SplitterAddress,
        CW721TicketAddress,
        OwnerAddress,
        token_id,
        MarketplaceAddress,
    } = props;
    const client = useAndromedaClient();

    // Types for the ticket tiers, a bit risky in type checks
    interface Tier {
        title: string;
        tickets: any[];
    }

    const [tiersTicketsList, setTiersTicketsList] = useState<Tier[]>([]);

    interface SellableTier {
        title: string;
        tickets: Array<{
            ticket: any;
            token_id: string;
            metadata: any;
        }>;
    }

    const [sellableTiersTicketsList, setSellableTiersTicketsList] = useState<
        SellableTier[]
    >([]);

    interface Token {
        token_id: string;
        owner: string;
        metadata: {
            image: string;
            name: string;
            description: string;
            attributes: Array<{
                trait_type: string;
                value: any;
                display_type?: string;
            }>;
        };
    }

    const [token, setToken] = useState<Token | undefined>();

    const [loading, setLoading] = useState(true);

    const query = useQueryContract(CW721Address);
    const queryTicket = useQueryContract(CW721TicketAddress);
    const executeTicket = useExecuteContract(CW721TicketAddress);
    const simulateTicket = useSimulateExecute(CW721TicketAddress);

    const fetchData = async () => {
        setLoading(true);
        if (!client || !query) {
            setLoading(false);
            return;
        }
        try {
            const token = await query({
                all_nft_info: {
                    token_id,
                },
            });

            const response = await fetch(token.info.token_uri);

            const metadata = await response.json();

            const tokenData = {
                token_id,
                owner: token.access.owner,
                metadata: metadata,
            };

            setLoading(false);

            const nonStringAttributes = metadata.attributes.filter(
                (attribute: any) => typeof attribute.value !== "string"
            );

            const arrayOfTiers = nonStringAttributes[0].value;

            let tiersList = [];
            let totalTiersList = [];

            for (const tier of arrayOfTiers) {
                let availableTicketsList = [];
                let totalTicketsList = [];
                for (let i = 0; i < tier.amount; i++) {
                    const ticket = await queryTicket({
                        all_nft_info: {
                            token_id: `${token_id}-ticket-${tier.title}-${i}`,
                        },
                    });
                    if (ticket.access.owner === MarketplaceAddress) {
                        availableTicketsList.push(ticket); // Only push tickets available in the marketplace
                    }
                    if (ticket.access.owner === OwnerAddress) {
                        const metadata = await fetch(ticket.info.token_uri);
                        totalTicketsList.push({
                            ticket,
                            metadata: await metadata.json(),
                            token_id: `${token_id}-ticket-${tier.title}-${i}`,
                        });
                    }
                }
                tiersList.push({
                    title: tier.title,
                    tickets: availableTicketsList,
                });
                totalTiersList.push({
                    title: tier.title,
                    tickets: totalTicketsList,
                });
            }

            setTiersTicketsList(tiersList);
            setSellableTiersTicketsList(totalTiersList);

            setToken(tokenData);
        } catch (error) {
            toast({
                title: "Error getting event",
                description: "There was an error getting event",
                duration: 5000,
                variant: "destructive",
            });

            console.error("Error querying contract:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [query, client]); // Fetch data whenever query or client changes

    const jsonToBase64 = (json: any) => {
        return Buffer.from(JSON.stringify(json)).toString("base64");
    };

    const handleSendTicketToMarketplace = async (ticket: {
        ticket_token_id: string;
        ticket_price: string;
        ticket_denom: string;
    }) => {
        setLoading(true);
        if (!client) {
            setLoading(false);
            return;
        }

        const msg = jsonToBase64({
            start_sale: {
                coin_denom: {
                    native_token: ticket.ticket_denom,
                },
                recipient: {
                    address: SplitterAddress,
                    ibc_recovery_address: null,
                    msg: "eyJzZW5kIjp7fX0=",
                },
                start_time: null,
                // Duration is set to nothing so that the organizer can take tickets off when they please, they don't have to continuously do things
                duration: null,
                price: ticket.ticket_price.toString(),
            },
        });

        try {
            const result = await simulateTicket(
                {
                    send_nft: {
                        contract: MarketplaceAddress,
                        token_id: ticket.ticket_token_id,
                        msg: msg,
                    },
                },
                [{ denom: ticket.ticket_denom, amount: "500000" }]
            );

            await executeTicket(
                {
                    send_nft: {
                        contract: MarketplaceAddress,
                        token_id: ticket.ticket_token_id,
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

            toast({
                title: "Ticket sent to marketplace",
                description: "Ticket has been sent to the marketplace",
                duration: 5000,
            });

            fetchData(); // Refresh data after sending ticket to marketplace
        } catch (error) {
            toast({
                title: "Error sending ticket to marketplace",
                description: "There was an error sending ticket to marketplace",
                duration: 5000,
                variant: "destructive",
            });
            setLoading(false);

            console.error("Error sending ticket to marketplace:", error);
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
                token && (
                    <div className="max-w-4xl mx-auto rounded overflow-hidden shadow-lg my-8 p-6 bg-black">
                        <img
                            className="w-full h-96 object-cover rounded-md"
                            src={token.metadata.image}
                            alt={token.metadata.name}
                            onError={(e) => {
                                e.currentTarget.src =
                                    "https://betterstudio.com/wp-content/uploads/2019/05/1-1-instagram-1024x1024.jpg"; // Fallback image if the original fails to load
                            }}
                        />

                        <div className="px-8 py-6">
                            <div className="font-bold text-3xl mb-4 text-center text-white">
                                {token.metadata.name}
                            </div>
                            <p className="text-gray-300 text-lg text-center mb-6">
                                {token.metadata.description}
                            </p>
                            <HoverCard>
                                <HoverCardTrigger className="text-white hover:text-gray-200 underline-offset-2 underline">
                                    View Ticket Tiers
                                </HoverCardTrigger>
                                <HoverCardContent className="bg-black">
                                    {token.metadata.attributes.map(
                                        (attribute: any, index: number) => {
                                            if (
                                                attribute.trait_type ===
                                                    "tiers" &&
                                                Array.isArray(attribute.value)
                                            ) {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="text-gray-300 col-span-2 bg-black"
                                                    >
                                                        <span className="font-semibold text-sm text-white mb-1">
                                                            Ticket Tiers
                                                        </span>
                                                        <div className="text-xs">
                                                            {attribute.value
                                                                .sort(
                                                                    (
                                                                        a: any,
                                                                        b: any
                                                                    ) =>
                                                                        a.price -
                                                                        b.price // Sort tiers by price
                                                                )
                                                                .map(
                                                                    (
                                                                        tier: any,
                                                                        tierIndex: number
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                tierIndex
                                                                            }
                                                                            className="p-1 rounded-md mb-1 bg-black"
                                                                        >
                                                                            <div className="font-semibold text-sm text-white">
                                                                                {
                                                                                    tier.title
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-gray-300">
                                                                                {
                                                                                    tiersTicketsList.find(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.title ===
                                                                                            tier.title
                                                                                    )
                                                                                        ?.tickets
                                                                                        .length
                                                                                }{" "}
                                                                                /{" "}
                                                                                {
                                                                                    tier.amount
                                                                                }{" "}
                                                                                tickets
                                                                                left
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }
                                    )}
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                        <div className="px-8 py-4 flex justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                <span className="font-semibold text-white">
                                    Token ID:
                                </span>{" "}
                                {token.token_id}
                            </p>
                            <p className="text-gray-400 text-sm">
                                <span className="font-semibold text-white">
                                    Owner:
                                </span>{" "}
                                {token.owner}
                            </p>
                        </div>
                        <div className="px-8 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                {token.metadata.attributes.map(
                                    (attribute: any, index: number) => {
                                        if (
                                            typeof attribute.value === "string"
                                        ) {
                                            return (
                                                <div
                                                    key={index}
                                                    className="text-gray-300"
                                                >
                                                    <span className="font-semibold text-white">
                                                        {attribute.display_type}
                                                    </span>
                                                    : {attribute.value}
                                                </div>
                                            );
                                        }
                                    }
                                )}
                            </div>
                        </div>
                        {address !== OwnerAddress && (
                            <div className="w-full flex justify-center">
                                <Link href={`${token_id}/purchase`}>
                                    <div className="px-6 py-2 mt-4 text-white bg-black border-white border rounded-md">
                                        Purchase Tickets
                                    </div>
                                </Link>
                            </div>
                        )}
                        {/* Ensure only the owner can see this */}
                        {address === OwnerAddress && (
                            <div className="px-8 py-4">
                                <div className="font-semibold text-xl mb-4 text-white mx-auto text-center">
                                    Sellable Tickets
                                </div>
                                {sellableTiersTicketsList.length === 0 && (
                                    <div className="text-gray-300">
                                        No sellable tickets found
                                    </div>
                                )}
                                <ScrollArea className="h-[800px] w-full rounded-md border p-4">
                                    {sellableTiersTicketsList.map(
                                        (tier, index) => (
                                            <div key={index} className="mb-4">
                                                <div className="font-semibold text-lg text-white">
                                                    {tier.title}
                                                </div>
                                                {tier.tickets.length === 0 && (
                                                    <div className="text-gray-300">
                                                        No sellable tickets for
                                                        this tier
                                                    </div>
                                                )}
                                                {tier.tickets.length > 0 && (
                                                    <table className="min-w-full bg-gray-800">
                                                        <thead>
                                                            <tr>
                                                                <th className="py-2 px-4 text-left text-white">
                                                                    Name
                                                                </th>
                                                                <th className="py-2 px-4 text-left text-white">
                                                                    Price
                                                                </th>
                                                                <th className="py-2 px-4 text-left text-white">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {tier.tickets.map(
                                                                (
                                                                    ticket,
                                                                    ticketIndex
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            ticketIndex
                                                                        }
                                                                        className="border-b border-gray-700"
                                                                    >
                                                                        <td className="py-2 px-4 text-gray-300">
                                                                            {
                                                                                ticket
                                                                                    .metadata
                                                                                    .name
                                                                            }
                                                                        </td>
                                                                        <td className="py-2 px-4 text-gray-300">
                                                                            {
                                                                                ticket.metadata.attributes.find(
                                                                                    (
                                                                                        attr: any
                                                                                    ) =>
                                                                                        attr.trait_type ===
                                                                                        "price"
                                                                                )
                                                                                    .value
                                                                            }{" "}
                                                                            {
                                                                                ticket.metadata.attributes.find(
                                                                                    (
                                                                                        attr: any
                                                                                    ) =>
                                                                                        attr.trait_type ===
                                                                                        "denom"
                                                                                )
                                                                                    .value
                                                                            }
                                                                        </td>
                                                                        <td className="py-2 px-4">
                                                                            <button
                                                                                className="px-4 py-2 bg-black border-white border text-white rounded-md hover:bg-gray-800"
                                                                                onClick={() =>
                                                                                    handleSendTicketToMarketplace(
                                                                                        {
                                                                                            ticket_token_id:
                                                                                                ticket.token_id,
                                                                                            ticket_price:
                                                                                                ticket.metadata.attributes.find(
                                                                                                    (
                                                                                                        attr: any
                                                                                                    ) =>
                                                                                                        attr.trait_type ===
                                                                                                        "price"
                                                                                                )
                                                                                                    .value,
                                                                                            ticket_denom:
                                                                                                ticket.metadata.attributes.find(
                                                                                                    (
                                                                                                        attr: any
                                                                                                    ) =>
                                                                                                        attr.trait_type ===
                                                                                                        "denom"
                                                                                                )
                                                                                                    .value,
                                                                                        }
                                                                                    )
                                                                                }
                                                                            >
                                                                                Send
                                                                                to
                                                                                Marketplace
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        )
                                    )}
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                )
            )}
        </>
    );
};
export default ShowEvent;
