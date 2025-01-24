import { ParticlesObject } from "./particles";
import React from "react";

interface Props {}

const Page = async (props: Props) => {
    // TODO: Add stats on this page, number of events, graph of shareholders
    return (
        <main>
            <div className="h-24"></div>
            <header className="flex gap-2 flex-col justify-center items-center z-10 relative">
                <h1 className="z-30 text-7xl max-md:text-5xl font-semibold w-full max-md:w-3/4 text-center text-white mt-36">
                    Your Decentralized Ticketing
                </h1>
                <h2 className="z-40 text-3xl max-md:text-2xl font-semibold w-1/2 max-md:w-3/4 text-center text-white">
                    Ticket3
                </h2>
                <div className="absolute inset-0 z-0">
                    <ParticlesObject position="absolute" />
                </div>
            </header>
        </main>
    );
};

export default Page;
