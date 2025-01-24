import { ApproveTicket, MakeEvent } from "@/modules/admin";
import React from "react";
import { CW721POAAddress, CW721TicketsAddress } from "@/ContractAddresses";

const Page = async ({ params }: { params: Promise<{ ticket: string }> }) => {
    const { ticket } = await params;

    return (
        <main>
            {ticket && (
                <ApproveTicket
                    CW721POAAddress={CW721POAAddress}
                    ticket={ticket}
                    CW721TicketAddress={CW721TicketsAddress}
                />
            )}
        </main>
    );
};

export default Page;
