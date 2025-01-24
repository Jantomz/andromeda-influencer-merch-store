"use client";
import React, { FC, useState } from "react";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { useAndromedaStore } from "@/zustand/andromeda";
import { useToast } from "@/hooks/use-toast";
import { OwnerAddress, TicketsMarketplaceAddress } from "@/ContractAddresses";

interface ApproveTicketProps {
    CW721POAAddress: string;
    ticket: string;
    CW721TicketAddress: string;
}

const ApproveTicket: FC<ApproveTicketProps> = (props) => {
    const { toast } = useToast(); // Custom hook for toast notifications

    const client = useAndromedaClient(); // Hook to get the Andromeda client
    const { CW721POAAddress } = props;
    const { CW721TicketAddress } = props;
    const { ticket } = props;

    const [isLoading, setIsLoading] = useState(false); // State to manage loading status

    const { accounts } = useAndromedaStore(); // Zustand store for Andromeda accounts
    const account = accounts[0];
    const userAddress = account?.address ?? ""; // Fallback to empty string if no address

    const execute = useExecuteContract(CW721POAAddress); // Hook to execute contract
    const simulate = useSimulateExecute(CW721POAAddress); // Hook to simulate contract execution
    const query = useQueryContract(CW721TicketAddress); // Hook to query contract

    const handleApprove = async () => {
        setIsLoading(true);
        if (!client || !userAddress) {
            setIsLoading(false);
            return;
        }

        if (userAddress !== OwnerAddress) {
            setIsLoading(false);
            toast({
                title: "Error approving ticket",
                description: "You cannot approve this ticket",
                duration: 5000,
                variant: "destructive",
            });
            return;
        }

        try {
            const token = await query({
                all_nft_info: {
                    token_id: ticket,
                },
            });

            if (
                token.access.owner === userAddress ||
                token.access.owner === TicketsMarketplaceAddress ||
                token.access.owner === OwnerAddress
            ) {
                setIsLoading(false);
                toast({
                    title: "Error approving ticket",
                    description: "You cannot approve this ticket",
                    duration: 5000,
                    variant: "destructive",
                });
                return;
            }

            const result = await simulate(
                {
                    mint: {
                        token_id: ticket + "-approved",
                        extension: {
                            publisher: "Ticket3",
                        },
                        owner: token.access.owner,
                    },
                },
                [{ denom: "uandr", amount: "500000" }] // Simulate with a specific amount
            );

            const data = await execute(
                {
                    mint: {
                        token_id: ticket + "-approved",
                        extension: {
                            publisher: "Ticket3",
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
                    gas: result.gas, // Use gas from simulation result
                }
            );

            if (!data.gasUsed) {
                return;
            }

            setIsLoading(false);
            toast({
                title: "Ticket Approved",
                description: "Ticket has been approved",
                duration: 5000,
            });

            window.location.href = "/"; // Redirect to home page after approval
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
        return <div className="text-red-500">Wallet Not Connected</div>; // Show error if wallet is not connected
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
