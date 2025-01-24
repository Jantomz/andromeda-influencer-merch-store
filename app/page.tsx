import { ShowEventStats, ShowShares } from "@/modules/collections";
import { ParticlesObject } from "./particles";
import React from "react";
import { CW721EventsAddress, SplitterAddress } from "@/ContractAddresses";

interface Props {}

const Page = async (props: Props) => {
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
                <h2 className="z-40 text-sm max-md:text-2xl font-semibold w-1/2 max-md:w-3/4 text-center text-white hover:text-gray-200">
                    <a
                        href="https://github.com/Jantomz/andromeda-ticket-3"
                        target="_blank"
                    >
                        View Github
                    </a>
                </h2>
                <div className="absolute inset-0 z-0">
                    <ParticlesObject position="absolute" />
                </div>
            </header>
            <div className="h-[500px]"></div>
            <section>
                <div className="h-[300px]"></div>
                <div className="flex justify-center items-center">
                    <h1 className="text-5xl max-md:text-3xl text-white text-left w-1/3 max-md:w-3/4 font-bold">
                        More Secure Tickets...
                    </h1>
                </div>
                <div className="h-[300px]"></div>
                <div className="flex flex-col max-md:flex-col justify-center items-center gap-4">
                    <h1 className="text-5xl max-md:text-3xl text-white text-left w-1/3 max-md:w-3/4 font-bold">
                        More Community-Owned Events...
                    </h1>
                    <ShowEventStats CW721Address={CW721EventsAddress} />
                </div>
                <div className="h-[300px]"></div>
                <div className="flex flex-col max-md:flex-col justify-center items-center gap-4">
                    <ShowShares SplitterAddress={SplitterAddress} />
                    <h1 className="text-5xl max-md:text-3xl text-white text-right w-1/3 max-md:w-3/4 font-bold">
                        More Community-Owned Shares...
                    </h1>
                </div>
                <div className="h-[300px]"></div>
                <h1 className="text-7xl max-md:text-4xl text-white text-center font-bold">
                    More Community-Owned...
                </h1>
                <div className="h-[300px]"></div>
                <h1 className="text-7xl max-md:text-4xl text-white text-center font-bold">
                    More Community
                </h1>
                <div className="flex justify-center items-center">
                    <img
                        src="/Ticket3_Logo.png"
                        alt="Logo"
                        className="w-1/4 max-md:w-1/2 h-auto"
                    />
                </div>
            </section>
        </main>
    );
};

export default Page;
