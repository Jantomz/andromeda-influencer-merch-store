import { ShowEvents } from "@/modules/collections";
import { CW721EventsAddress } from "@/ContractAddresses";

const Page = async () => {
    return (
        <main>
            <ShowEvents CW721Address={CW721EventsAddress} />
        </main>
    );
};

export default Page;
