import { useExecuteContract, useSimulateExecute } from "@/lib/andrjs";
import { MakeEvent, MakeShares, UpdateSharesSplits } from "@/modules/admin";
import SendShares from "@/modules/admin/components/SendShares";
import Layout from "@/modules/general/components/Layout";
import { useAndromedaStore } from "@/zustand/andromeda";
import React from "react";

interface Props {}

const Page = async (props: Props) => {
    return (
        <main>
            <MakeEvent
                CW721Address="andr1zmsh5cdv42nunkx4z3enfs0uyn2sxz82qtfkfwuslvzkmhmtennql5a6tn"
                TicketCW721Address="andr1t5rfxzn207pw83562dx6r3esfe3m4wcc49gyldxuydnh8mp79mysj2hcqk"
            />
            {/* <MakeShares /> */}
            {/* <SendShares
                MarketplaceAddress="andr1ld0mdudnnkt9vh8zcwqt0a6qc8wvmjh927j8y8kjy6zcn0skhdds78pkd5"
                OwnerAddress="andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx"
                CW721SharesAddress="andr1qhndf3kcpqxqxc33p042wae6d95svr5an292wt765n8jxq2wccgq0vyldt"
            /> */}
            <UpdateSharesSplits
                SplitterAddress="andr13u9j2c65yqd0a06vfx37ywc5x9dqzly4pwzlk2ys5d9jjxsewhuqm87x7t"
                CW721SharesAddress="andr1qhndf3kcpqxqxc33p042wae6d95svr5an292wt765n8jxq2wccgq0vyldt"
                MarketplaceAddress="andr1ld0mdudnnkt9vh8zcwqt0a6qc8wvmjh927j8y8kjy6zcn0skhdds78pkd5"
                OwnerAddress="andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx"
            />
        </main>
    );
};

export default Page;
