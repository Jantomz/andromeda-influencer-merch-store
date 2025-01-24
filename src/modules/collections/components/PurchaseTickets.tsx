"use client";
import React, { FC, useEffect, useState } from "react";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface PurchaseTicketsProps {
    CW721Address: string;
    CW721TicketAddress: string;
    token_id: string;
    MarketplaceAddress: string;
    OwnerAddress: string;
}
const PurchaseTickets: FC<PurchaseTicketsProps> = (props) => {
    const { toast } = useToast();

    const { CW721Address, CW721TicketAddress, token_id, MarketplaceAddress } =
        props;
    const client = useAndromedaClient();

    const [buyableTiersTicketsList, setBuyableTiersTicketsList] = useState<any[]>([]);
    const [token, setToken] = useState<any>();

    const [loading, setLoading] = useState(true);

    const query = useQueryContract(CW721Address);
    const queryTicket = useQueryContract(CW721TicketAddress);
    const executePurchase = useExecuteContract(MarketplaceAddress);
    const simulatePurchase = useSimulateExecute(MarketplaceAddress);

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

            const nonStringAttributes = metadata.attributes.filter(
                (attribute: any) => typeof attribute.value !== "string"
            );

            const arrayOfTiers = nonStringAttributes[0].value;

            let totalTiersList = [];

            for (const tier of arrayOfTiers) {
                let totalTicketsList = [];
                for (let i = 0; i < tier.amount; i++) {
                    const ticket = await queryTicket({
                        all_nft_info: {
                            token_id: `${token_id}-ticket-${tier.title}-${i}`,
                        },
                    });
                    if (ticket.access.owner === MarketplaceAddress) {
                        const metadata = await fetch(ticket.info.token_uri);
                        totalTicketsList.push({
                            ticket,
                            metadata: await metadata.json(),
                            token_id: `${token_id}-ticket-${tier.title}-${i}`,
                        });
                    }
                }
                totalTiersList.push({
                    title: tier.title,
                    tickets: totalTicketsList,
                });
            }

            setBuyableTiersTicketsList(totalTiersList);

            setToken(tokenData);
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

    useEffect(() => {
        fetchData();
    }, [query, client]);

    const handlePurchaseTicket = async (tier: string) => {
        setLoading(true);
        if (!client) {
            setLoading(false);
            return;
        }

        fetchData();

        // Finds the actual next possible ticket to purchase to avoid race conditions?
        const ticket = buyableTiersTicketsList
            .find((t) => t.title === tier)
            ?.tickets.find(
                (t: {
                    ticket: {
                        access: { owner: string };
                    };
                }) => t.ticket.access.owner === MarketplaceAddress
            );

        try {
            const result = await simulatePurchase(
                {
                    buy: {
                        token_address: CW721TicketAddress,
                        token_id: ticket.token_id,
                    },
                },
                [
                    {
                        denom: ticket.metadata.attributes.find(
                            (attr: any) => attr.trait_type === "denom"
                        ).value,
                        amount: "500000",
                    },
                ]
            );

            const price = ticket.metadata.attributes.find(
                (attr: any) => attr.trait_type === "price"
            ).value;

            await executePurchase(
                {
                    buy: {
                        token_address: CW721TicketAddress,
                        token_id: ticket.token_id,
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
                },
                "Purchase ticket",
                [
                    {
                        denom: result.amount[0].denom,
                        amount: price.toString(),
                    },
                ]
            );

            toast({
                title: "Ticket Purchased",
                description: "You have successfully purchased a ticket",
                duration: 5000,
            });
            setLoading(false);

            fetchData();
        } catch (error) {
            toast({
                title: "Error purchasing ticket",
                description: "There was an error purchasing a ticket",
                duration: 5000,
                variant: "destructive",
            });

            console.error("Error purchasing ticket:", error);
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

                        <div className="px-8 py-6">
                            <div className="font-bold text-3xl mb-4 text-center text-white">
                                Purchase Tickets for {token.metadata.name}
                            </div>
                            <p className="text-gray-300 text-lg text-center mb-6">
                                {token.metadata.description}
                            </p>
                        </div>
                        <div className="px-8 py-4 w-full">
                            <div className="font-semibold text-xl mb-4 text-white text-center">
                                Purchasable Tickets
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {buyableTiersTicketsList.map((tier, index) => (
                                    <>
                                        {tier.tickets.slice(0, 1).map(
                                            (
                                                ticket: {
                                                    ticket: any;
                                                    token_id: string;
                                                    metadata: any;
                                                },
                                                ticketIndex: number
                                            ) => (
                                                <Card
                                                    key={ticketIndex}
                                                    className="mb-2 bg-black text-white w-1/3"
                                                >
                                                    <CardHeader>
                                                        <div className="flex items-center flex-col">
                                                            <div className="font-semibold text-lg text-white w-min">
                                                                {tier.title}
                                                            </div>

                                                            <img
                                                                className="w-16 h-16 object-cover rounded-md m-4"
                                                                src={
                                                                    ticket
                                                                        .metadata
                                                                        .image
                                                                }
                                                                alt={
                                                                    ticket
                                                                        .metadata
                                                                        .name
                                                                }
                                                            />
                                                            <div>
                                                                <CardTitle className="font-semibold text-sm">
                                                                    {
                                                                        ticket
                                                                            .metadata
                                                                            .name
                                                                    }
                                                                </CardTitle>
                                                                <CardDescription className="text-gray-300">
                                                                    {
                                                                        ticket
                                                                            .metadata
                                                                            .description
                                                                    }
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="mt-4 text-gray-300">
                                                        {ticket.metadata.attributes.map(
                                                            (
                                                                attribute: any,
                                                                index: number
                                                            ) => (
                                                                <p
                                                                    key={index}
                                                                    className="text-xs"
                                                                >
                                                                    <span className="font-semibold text-white">
                                                                        {
                                                                            attribute.display_type
                                                                        }
                                                                        :
                                                                    </span>{" "}
                                                                    {
                                                                        attribute.value
                                                                    }
                                                                </p>
                                                            )
                                                        )}
                                                    </CardContent>
                                                    <CardFooter>
                                                        <button
                                                            className="mt-2 px-4 py-2 bg-black border text-white rounded-md mx-auto hover:bg-gray-900"
                                                            onClick={() =>
                                                                handlePurchaseTicket(
                                                                    tier.title
                                                                )
                                                            }
                                                        >
                                                            Purchase
                                                        </button>
                                                    </CardFooter>
                                                </Card>
                                            )
                                        )}
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            )}
        </>
    );
};
export default PurchaseTickets;
