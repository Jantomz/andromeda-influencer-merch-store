import { MakeEvent } from "@/modules/admin";
import Layout from "@/modules/general/components/Layout";
import React from "react";

interface Props {}

const Page = async (props: Props) => {
    return (
        <main>
            <h1>Send Tickets to Marketplace By Going to Event</h1>
            <h1>Make Event</h1>
            <MakeEvent
                CW721Address="andr1zmsh5cdv42nunkx4z3enfs0uyn2sxz82qtfkfwuslvzkmhmtennql5a6tn"
                TicketCW721Address="andr1t5rfxzn207pw83562dx6r3esfe3m4wcc49gyldxuydnh8mp79mysj2hcqk"
            />
        </main>
    );
};

export default Page;
