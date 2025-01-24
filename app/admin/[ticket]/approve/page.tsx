import { ApproveTicket, MakeEvent } from "@/modules/admin";
import React from "react";
import { CW721POAAddress, CW721TicketsAddress } from "@/ContractAddresses";

interface Props {}

const Page = async ({ params }: { params: Promise<{ ticket: string }> }) => {
    const ticket = (await params).ticket;

    return (
        <main>
            <ApproveTicket
                CW721POAAddress={CW721POAAddress}
                ticket={ticket}
                CW721TicketAddress={CW721TicketsAddress}
            />
        </main>
    );
};

export default Page;
