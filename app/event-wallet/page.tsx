import { ShowEvents } from "@/modules/collections";
import ShowTickets from "@/modules/collections/components/ShowTickets";
import { CW721TicketsAddress, CW721POAAddress } from "@/ContractAddresses";

const Page = async () => {
    return (
        <main>
            <ShowTickets
                CW721POAAddress={CW721POAAddress}
                CW721TicketAddress={CW721TicketsAddress}
            />
        </main>
    );
};

export default Page;
