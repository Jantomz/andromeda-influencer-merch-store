import { PurchaseTickets } from "@/modules/collections";
import {
    CW721EventsAddress,
    CW721TicketsAddress,
    TicketsMarketplaceAddress,
    OwnerAddress,
} from "@/ContractAddresses";

const Page = async ({ params }: { params: Promise<{ event: string }> }) => {
    const event = (await params).event;

    return (
        <main>
            <PurchaseTickets
                token_id={event}
                CW721Address={CW721EventsAddress}
                CW721TicketAddress={CW721TicketsAddress}
                MarketplaceAddress={TicketsMarketplaceAddress}
                OwnerAddress={OwnerAddress}
            />
        </main>
    );
};

export default Page;
