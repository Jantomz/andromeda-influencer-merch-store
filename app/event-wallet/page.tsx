import { ShowEvents } from "@/modules/collections";
import ShowTickets from "@/modules/collections/components/ShowTickets";
import Layout from "@/modules/general/components/Layout";

const Page = async () => {
    return (
        <main>
            <ShowTickets CW721TicketAddress="andr1t5rfxzn207pw83562dx6r3esfe3m4wcc49gyldxuydnh8mp79mysj2hcqk" />
        </main>
    );
};

export default Page;
