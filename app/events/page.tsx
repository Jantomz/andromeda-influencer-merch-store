import { ShowEvents } from "@/modules/collections";
import Layout from "@/modules/general/components/Layout";

const Page = async () => {
    return (
        <main>
            <ShowEvents CW721Address="andr1zmsh5cdv42nunkx4z3enfs0uyn2sxz82qtfkfwuslvzkmhmtennql5a6tn" />
        </main>
    );
};

export default Page;
