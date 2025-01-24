"use client";
import React, { FC, useEffect, useState } from "react";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { useAndromedaStore } from "@/zustand/andromeda";
import { useToast } from "@/hooks/use-toast";

interface ApproveTicketProps {
    CW721POAAddress: string;
    ticket: string;
    CW721TicketAddress: string;
}

const ApproveTicket: FC<ApproveTicketProps> = (props) => {
    const { toast } = useToast();

    const client = useAndromedaClient();
    const { CW721POAAddress } = props;
    const { CW721TicketAddress } = props;
    const { ticket } = props;

    const [isLoading, setIsLoading] = useState(false);

    const { accounts } = useAndromedaStore();
    const account = accounts[0];
    const userAddress = account?.address ?? "";

    const execute = useExecuteContract(CW721POAAddress);
    const simulate = useSimulateExecute(CW721POAAddress);
    const query = useQueryContract(CW721TicketAddress);

    const handleApprove = async () => {
        // TODO: Make sure the ticket is not owned by the marketplace or the event creator, and has not been approved yet
        // TODO: Only the event creator can approve the ticket
        setIsLoading(true);
        if (!client || !userAddress) {
            setIsLoading(false);
            return;
        }

        try {
            const token = await query({
                all_nft_info: {
                    token_id: ticket,
                },
            });

            const result = await simulate(
                {
                    mint: {
                        token_id: ticket + "-approved",
                        extension: {
                            // TODO: Change this
                            publisher: "App Developer",
                        },
                        owner: token.access.owner,
                    },
                },
                [{ denom: "uandr", amount: "500000" }]
            );

            const data = await execute(
                {
                    mint: {
                        token_id: ticket + "-approved",
                        extension: {
                            publisher: "App Developer",
                        },
                        owner: token.access.owner,
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

            // TODO: show toast

            // Mint Tickets

            setIsLoading(false);
            toast({
                title: "Ticket Approved",
                description: "Ticket has been approved",
                duration: 5000,
            });

            window.location.href = "/";
        } catch (error) {
            console.error("Error approving ticket:", error);
            setIsLoading(false);
            toast({
                title: "Error approving ticket",
                description: "There was an error approving the ticket",
                duration: 5000,
                variant: "destructive",
            });
        }
    };

    if (!client) {
        return <div className="text-red-500">Wallet Not Connected</div>;
    }
    return (
        <section className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-white">
                Approve Ticket
            </h1>

            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    <span className="ml-2 text-gray-300">Loading...</span>
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => handleApprove()}
                        className="bg-black border border-white text-white px-4 py-2 rounded-md hover:bg-gray-800"
                    >
                        Approve Ticket
                    </button>
                </div>
            )}
        </section>
    );
};
export default ApproveTicket;
