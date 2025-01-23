"use client";
import React, { FC, useEffect, useState } from "react";
import { useExecuteContract, useSimulateExecute } from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { useAndromedaStore } from "@/zustand/andromeda";

interface MakeEventProps {
    CW721Address: string;
    TicketCW721Address: string;
}

const MakeEvent: FC<MakeEventProps> = (props) => {
    const client = useAndromedaClient();
    const eventCW721 = props.CW721Address;
    const ticketCW721 = props.TicketCW721Address;
    const baseURL = window.location.origin;
    const [tokenId, setTokenId] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [tiers, setTiers] = useState<
        {
            title: string;
            perks: string;
            price: number;
            denom: string;
            amount: number;
            image: string;
        }[]
    >([]);

    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const userAddress = account?.address ?? "";

    const execute = useExecuteContract(eventCW721);
    const simulate = useSimulateExecute(eventCW721);

    const executeTicket = useExecuteContract(ticketCW721);
    const simulateTicket = useSimulateExecute(ticketCW721);

    const handleMint = async (
        t_id: string,
        m_uri: string,
        n: string,
        d: string,
        i: string,
        d_start: string,
        d_end: string,
        l: string
    ) => {
        setIsLoading(true);
        if (!client || !userAddress) {
            setIsLoading(false);
            return;
        }

        const result = await simulate(
            {
                mint: {
                    token_id: t_id,
                    extension: {
                        // TODO: Change this
                        publisher: "App Developer",
                    },
                    owner: userAddress,
                    token_uri: m_uri,
                },
            },
            [{ denom: "uandr", amount: "500000" }]
        );

        const data = await execute(
            {
                mint: {
                    token_id: t_id,
                    extension: {
                        publisher: "App Developer",
                    },
                    owner: userAddress,
                    token_uri: m_uri,
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

        console.log("data", data);

        if (!data.gasUsed) {
            return;
        }

        const dbResult = await fetch("/api/event-metadata", {
            method: "POST",
            body: JSON.stringify({
                token_id: t_id,
                name: n,
                description: d,
                image: i,
                attributes: [
                    {
                        display_type: "Start Date",
                        trait_type: "dateStart",
                        value: d_start,
                    },
                    {
                        display_type: "End Date",
                        trait_type: "dateEnd",
                        value: d_end,
                    },
                    {
                        display_type: "Location",
                        trait_type: "location",
                        value: l,
                    },
                    {
                        display_type: "Ticket Tiers",
                        trait_type: "tiers",
                        value: tiers,
                    },
                ],
            }),
        });

        console.log(dbResult);
        // TODO: show toast

        // Mint Tickets
        for (const tier of tiers) {
            const batchSize = 100;
            for (
                let batchStart = 0;
                batchStart < tier.amount;
                batchStart += batchSize
            ) {
                const batchEnd = Math.min(batchStart + batchSize, tier.amount);
                const batchTokens = Array.from({
                    length: batchEnd - batchStart,
                }).map((_, i) => ({
                    token_id: `${t_id}-ticket-${tier.title}-${batchStart + i}`,
                    extension: {
                        // TODO: Change this
                        publisher: "App Developer",
                    },
                    owner: userAddress,
                    token_uri:
                        baseURL +
                        `/api/tickets-metadata?token_id=${t_id}-ticket-${tier.title}-${batchStart + i}`,
                }));

                const ticketResult = await simulateTicket(
                    {
                        batch_mint: {
                            tokens: batchTokens,
                        },
                    },
                    [
                        {
                            denom: tier.denom,
                            amount: (tier.price * 100).toString(),
                        },
                    ]
                );

                const ticketData = await executeTicket(
                    {
                        batch_mint: {
                            tokens: batchTokens,
                        },
                    },
                    {
                        amount: [
                            {
                                denom: ticketResult.amount[0].denom,
                                amount: ticketResult.amount[0].amount,
                            },
                        ],
                        gas: ticketResult.gas,
                    }
                );

                const dbTicketResult = await fetch("/api/tickets-metadata", {
                    method: "POST",
                    body: JSON.stringify(
                        batchTokens.map((token) => ({
                            token_id: token.token_id,
                            name: `${tier.title} Ticket for ${n}`,
                            description: `Admit one ${tier.title} to ${n} on ${d_start} at ${l} for ${tier.price} ${tier.denom}`,
                            image: tier.image,
                            attributes: [
                                {
                                    display_type: "Tier",
                                    trait_type: "tier",
                                    value: tier.title,
                                },
                                {
                                    display_type: "Perks",
                                    trait_type: "perks",
                                    value: tier.perks,
                                },
                                {
                                    display_type: "Price",
                                    trait_type: "price",
                                    value: tier.price,
                                },
                                {
                                    display_type: "Denom",
                                    trait_type: "denom",
                                    value: tier.denom,
                                },
                                {
                                    display_type: "Event",
                                    trait_type: "event",
                                    value: n,
                                },
                                {
                                    display_type: "Start Date",
                                    trait_type: "dateStart",
                                    value: d_start,
                                },
                                {
                                    display_type: "End Date",
                                    trait_type: "dateEnd",
                                    value: d_end,
                                },
                                {
                                    display_type: "Location",
                                    trait_type: "location",
                                    value: l,
                                },
                            ],
                        }))
                    ),
                });

                console.log(dbTicketResult);

                console.log("ticketData", ticketData);
            }
        }
        setIsLoading(false);

        // send_nft
        //         contract
        // :
        // "andr13kr2jfd9a6j9qq5eevaxdkzljw04uzrftactfzea2e7pldpu7lkqe6l9mk"
        // msg
        // :
        // "eyJzdGFydF9zYWxlIjp7ImNvaW5fZGVub20iOnsibmF0aXZlX3Rva2VuIjoidWFuZHIifSwicmVjaXBpZW50IjpudWxsLCJzdGFydF90aW1lIjpudWxsLCJkdXJhdGlvbiI6bnVsbCwicHJpY2UiOiI1MDAifX0="
        // token_id
        // :
        // "canada-national-super-spelling-bee-ticket-Speller-0"

        // the msg is base64 encoded with the price changing the code

        window.location.href = "/";
    };

    if (!client) {
        return <div className="text-red-500">Wallet Not Connected</div>;
    }
    return (
        <section className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Make Event</h1>

            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-gray-700">Loading...</span>
                </div>
            ) : (
                <div>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const name = formData.get("name") as string;
                            const description = formData.get(
                                "description"
                            ) as string;
                            const image = formData.get("image") as string;
                            const dateStart = formData.get(
                                "date-start"
                            ) as string;
                            const dateEnd = formData.get("date-end") as string;
                            const location = formData.get("location") as string;
                            if (new Date(dateEnd) < new Date(dateStart)) {
                                alert(
                                    "End date must be the same as or later than the start date."
                                );
                                return;
                            }

                            const metadataURI =
                                baseURL +
                                "/api/event-metadata?token_id=" +
                                tokenId;

                            console.log(
                                JSON.stringify({
                                    token_id: tokenId,
                                    name,
                                    description,
                                    image,
                                    attributes: [
                                        {
                                            display_type: "Start Date",
                                            trait_type: "dateStart",
                                            value: dateStart,
                                        },
                                        {
                                            display_type: "End Date",
                                            trait_type: "dateEnd",
                                            value: dateEnd,
                                        },
                                        {
                                            display_type: "Location",
                                            trait_type: "location",
                                            value: location,
                                        },
                                        {
                                            display_type: "Ticket Tiers",
                                            trait_type: "tiers",
                                            value: tiers,
                                        },
                                    ],
                                })
                            );

                            await handleMint(
                                tokenId,
                                metadataURI,
                                name,
                                description,
                                image,
                                dateStart,
                                dateEnd,
                                location
                            );
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-4">
                            <p className="block text-gray-600">
                                Event Token ID: {tokenId}
                            </p>
                            <label className="block">
                                Name:
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]/g, "-");
                                        if (value.includes("ticket")) {
                                            alert(
                                                'The name cannot contain the word "ticket".'
                                            );
                                        } else {
                                            setTokenId(value);
                                        }
                                    }}
                                />
                            </label>
                            <label className="block">
                                Description:
                                <input
                                    type="text"
                                    name="description"
                                    required
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </label>
                            <label className="block">
                                Image URL:
                                <input
                                    type="text"
                                    name="image"
                                    required
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </label>
                            <label className="block">
                                Start Date:
                                <input
                                    type="date"
                                    name="date-start"
                                    required
                                    defaultValue={
                                        new Date().toISOString().split("T")[0]
                                    }
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </label>
                            <label className="block">
                                End Date:
                                <input
                                    type="date"
                                    name="date-end"
                                    required
                                    defaultValue={
                                        new Date().toISOString().split("T")[0]
                                    }
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </label>
                            <label className="block">
                                Location:
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </label>
                            <div>
                                <h2 className="text-xl font-semibold mb-2">
                                    Ticket Tiers
                                </h2>
                                {tiers.map((tier, index) => (
                                    <div
                                        key={index}
                                        className="space-y-2 mb-4 p-4 border border-gray-300 rounded-md"
                                    >
                                        <label className="block">
                                            Title:
                                            <input
                                                type="text"
                                                name={`tier-title-${index}`}
                                                value={tier.title}
                                                onChange={(e) => {
                                                    const newTiers = [...tiers];
                                                    newTiers[index].title =
                                                        e.target.value;
                                                    setTiers(newTiers);
                                                }}
                                                required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </label>
                                        <label className="block">
                                            Perks:
                                            <textarea
                                                name={`tier-perks-${index}`}
                                                value={tier.perks}
                                                onChange={(e) => {
                                                    const newTiers = [...tiers];
                                                    newTiers[index].perks =
                                                        e.target.value;
                                                    setTiers(newTiers);
                                                }}
                                                required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </label>
                                        <label className="block">
                                            Price:
                                            <input
                                                type="number"
                                                name={`tier-price-${index}`}
                                                value={tier.price}
                                                onChange={(e) => {
                                                    const newTiers = [...tiers];
                                                    newTiers[index].price =
                                                        parseFloat(
                                                            e.target.value
                                                        );
                                                    setTiers(newTiers);
                                                }}
                                                required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </label>
                                        <label className="block">
                                            Denom:
                                            <input
                                                type="text"
                                                name={`tier-denom-${index}`}
                                                value={tier.denom}
                                                onChange={(e) => {
                                                    const newTiers = [...tiers];
                                                    newTiers[index].denom =
                                                        e.target.value;
                                                    setTiers(newTiers);
                                                }}
                                                required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </label>
                                        <label className="block">
                                            # of Tickets to Mint:
                                            <input
                                                type="number"
                                                name={`tier-amount-${index}`}
                                                value={tier.amount}
                                                onChange={(e) => {
                                                    const newTiers = [...tiers];
                                                    newTiers[index].amount =
                                                        parseInt(
                                                            e.target.value,
                                                            10
                                                        );
                                                    setTiers(newTiers);
                                                }}
                                                required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </label>
                                        <label className="block">
                                            Ticket Image URL:
                                            <input
                                                type="text"
                                                name={`tier-image-${index}`}
                                                value={tier.image}
                                                onChange={(e) => {
                                                    const newTiers = [...tiers];
                                                    newTiers[index].image =
                                                        e.target.value;
                                                    setTiers(newTiers);
                                                }}
                                                required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newTiers = tiers.filter(
                                                    (_, i) => i !== index
                                                );
                                                setTiers(newTiers);
                                            }}
                                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md"
                                        >
                                            Remove Tier
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTiers([
                                            ...tiers,
                                            {
                                                title: "",
                                                perks: "",
                                                price: 0,
                                                denom: "",
                                                amount: 0,
                                                image: "",
                                            },
                                        ])
                                    }
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                                >
                                    Add Tier
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
                        >
                            Create Event
                        </button>
                    </form>
                </div>
            )}
        </section>
    );
};
export default MakeEvent;
