"use client";
import React, { FC, useEffect, useState } from "react";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";

interface ShowEventProps {
    CW721Address: string;
    CW721TicketAddress: string;
    token_id: string;
    MarketplaceAddress: string;
    OwnerAddress: string;
}
const ShowEvent: FC<ShowEventProps> = (props) => {
    const { CW721Address } = props;
    const { CW721TicketAddress } = props;
    const { OwnerAddress } = props;
    const { token_id } = props;
    const { MarketplaceAddress } = props;
    const client = useAndromedaClient();
    const [tiersTicketsList, setTiersTicketsList] = useState<any[]>([]);
    const [sellableTiersTicketsList, setSellableTiersTicketsList] = useState<
        any[]
    >([]);
    // TODO: Fix any
    const [token, setToken] = useState<any>();

    const query = useQueryContract(CW721Address);
    const queryTicket = useQueryContract(CW721TicketAddress);
    const executeTicket = useExecuteContract(CW721TicketAddress);
    const simulateTicket = useSimulateExecute(CW721TicketAddress);

    useEffect(() => {
        const fetchData = async () => {
            if (!client || !query) {
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
                            availableTicketsList.push(ticket);
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
                // console.log(tiersList);
                // console.log(JSON.stringify(totalTiersList));

                setToken(tokenData);
            } catch (error) {
                console.error("Error querying contract:", error);
            }
        };

        fetchData();
    }, [query, client]);

    const jsonToBase64 = (json: any) => {
        return Buffer.from(JSON.stringify(json)).toString("base64");
    };

    const handleSendTicketToMarketplace = async (ticket: {
        ticket_token_id: string;
        ticket_price: string;
        ticket_denom: string;
        duration?: number;
    }) => {
        console.log(ticket);
        if (!client) {
            return;
        }
        const msg = jsonToBase64({
            start_sale: {
                coin_denom: {
                    native_token: ticket.ticket_denom,
                },
                recipient: null,
                start_time: null,
                duration: ticket.duration || 7200000,
                price: ticket.ticket_price.toString(),
            },
        });

        console.log(msg);

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
        } catch (error) {
            console.error("Error sending ticket to marketplace:", error);
        }
    };

    return (
        <>
            {token && (
                <div className="max-w-4xl mx-auto rounded overflow-hidden shadow-lg my-8 p-6 bg-white">
                    <img
                        className="w-full h-96 object-cover rounded-md"
                        src={token.metadata.image}
                        alt={token.metadata.name}
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://betterstudio.com/wp-content/uploads/2019/05/1-1-instagram-1024x1024.jpg";
                        }}
                    />

                    <div className="px-8 py-6">
                        <div className="font-bold text-3xl mb-4 text-center">
                            {token.metadata.name}
                        </div>
                        <p className="text-gray-700 text-lg text-center mb-6">
                            {token.metadata.description}
                        </p>
                    </div>
                    <div className="px-8 py-4 flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            <span className="font-semibold">Token ID:</span>{" "}
                            {token.token_id}
                        </p>
                        <p className="text-gray-600 text-sm">
                            <span className="font-semibold">Owner:</span>{" "}
                            {token.owner}
                        </p>
                    </div>
                    <div className="px-8 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            {token.metadata.attributes.map(
                                (attribute: any, index: number) => {
                                    if (typeof attribute.value === "string") {
                                        return (
                                            <div
                                                key={index}
                                                className="text-gray-700"
                                            >
                                                <span className="font-semibold">
                                                    {attribute.display_type}
                                                </span>
                                                : {attribute.value}
                                            </div>
                                        );
                                    } else if (
                                        attribute.trait_type === "tiers" &&
                                        Array.isArray(attribute.value)
                                    ) {
                                        return (
                                            <div
                                                key={index}
                                                className="text-gray-700 col-span-2"
                                            >
                                                <span className="font-semibold text-xl">
                                                    Ticket Tiers
                                                </span>
                                                <div className="mt-2">
                                                    {attribute.value
                                                        .sort(
                                                            (a: any, b: any) =>
                                                                a.price -
                                                                b.price
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
                                                                    className={`border p-4 rounded-md mb-4 ${
                                                                        tierIndex ===
                                                                        0
                                                                            ? "bg-yellow-200"
                                                                            : tierIndex ===
                                                                                1
                                                                              ? "bg-gray-400"
                                                                              : tierIndex ===
                                                                                  3
                                                                                ? "bg-amber-600"
                                                                                : "bg-white"
                                                                    }`}
                                                                >
                                                                    <div className="font-semibold text-lg">
                                                                        {
                                                                            tier.title
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm">
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
                                                                        }
                                                                        /
                                                                        {
                                                                            tier.amount
                                                                        }{" "}
                                                                        tickets
                                                                        left
                                                                    </div>
                                                                    <p>
                                                                        <span className="font-semibold">
                                                                            Amount:
                                                                        </span>{" "}
                                                                        {
                                                                            tier.amount
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        <span className="font-semibold">
                                                                            Denom:
                                                                        </span>{" "}
                                                                        {
                                                                            tier.denom
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        <span className="font-semibold">
                                                                            Price:
                                                                        </span>{" "}
                                                                        {
                                                                            tier.price
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        <span className="font-semibold">
                                                                            Perks:
                                                                        </span>{" "}
                                                                        {tier.perks
                                                                            .split(
                                                                                "\n"
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    perk: string,
                                                                                    perkIndex: number
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            perkIndex
                                                                                        }
                                                                                        className="block"
                                                                                    >
                                                                                        {
                                                                                            perk
                                                                                        }
                                                                                    </span>
                                                                                )
                                                                            )}
                                                                    </p>
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
                        </div>
                    </div>

                    <div className="px-8 py-4">
                        <div className="font-semibold text-xl mb-4">
                            Sellable Tickets
                        </div>
                        {sellableTiersTicketsList.map((tier, index) => (
                            <div key={index} className="mb-4">
                                <div className="font-semibold text-lg">
                                    {tier.title}
                                </div>
                                {tier.tickets.map(
                                    (
                                        ticket: {
                                            ticket: any;
                                            token_id: string;
                                            metadata: any;
                                        },
                                        ticketIndex: number
                                    ) => (
                                        <div
                                            key={ticketIndex}
                                            className="border p-4 rounded-md mb-2 bg-white"
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    className="w-16 h-16 object-cover rounded-md mr-4"
                                                    src={ticket.metadata.image}
                                                    alt={ticket.metadata.name}
                                                />
                                                <div>
                                                    <p className="font-semibold text-lg">
                                                        {ticket.metadata.name}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {
                                                            ticket.metadata
                                                                .description
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                {ticket.metadata.attributes.map(
                                                    (
                                                        attribute: any,
                                                        index: number
                                                    ) => (
                                                        <p key={index}>
                                                            <span className="font-semibold">
                                                                {
                                                                    attribute.display_type
                                                                }
                                                                :
                                                            </span>{" "}
                                                            {attribute.value}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                            <p className="mt-4">
                                                <span className="font-semibold">
                                                    Ticket ID:
                                                </span>{" "}
                                                {ticket.token_id}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Owner:
                                                </span>{" "}
                                                {ticket.ticket.access.owner}
                                            </p>
                                            <button
                                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                                                onClick={() =>
                                                    handleSendTicketToMarketplace(
                                                        {
                                                            // TODO: Change the duration
                                                            ticket_token_id:
                                                                ticket.token_id,
                                                            duration: 7200000,
                                                            ticket_price:
                                                                ticket.metadata.attributes.find(
                                                                    (
                                                                        attribute: any
                                                                    ) =>
                                                                        attribute.trait_type ===
                                                                        "price"
                                                                ).value,
                                                            ticket_denom:
                                                                ticket.metadata.attributes.find(
                                                                    (
                                                                        attribute: any
                                                                    ) =>
                                                                        attribute.trait_type ===
                                                                        "denom"
                                                                ).value,
                                                        }
                                                    )
                                                }
                                            >
                                                Send to Marketplace
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
export default ShowEvent;
