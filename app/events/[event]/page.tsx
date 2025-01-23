import { ShowEvent } from "@/modules/collections";
import Layout from "@/modules/general/components/Layout";

const Page = async ({ params }: { params: Promise<{ event: string }> }) => {
    const event = (await params).event;

    return (
        <main>
            <ShowEvent
                token_id={event}
                CW721Address="andr1zmsh5cdv42nunkx4z3enfs0uyn2sxz82qtfkfwuslvzkmhmtennql5a6tn"
                CW721TicketAddress="andr1t5rfxzn207pw83562dx6r3esfe3m4wcc49gyldxuydnh8mp79mysj2hcqk"
                MarketplaceAddress="andr13kr2jfd9a6j9qq5eevaxdkzljw04uzrftactfzea2e7pldpu7lkqe6l9mk"
                OwnerAddress="andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx"
            />
        </main>
    );
};

export default Page;
