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
                <h1 className="z-30 text-7xl max-md:text-3xl font-semibold w-full max-md:w-full text-center text-white mt-36">
                    Your Decentralized Ticketing
                </h1>
                <h2 className="z-40 text-3xl max-md:text-xl font-semibold w-1/2 max-md:w-3/4 text-center text-white">
                    Ticket3
                </h2>
                <h2 className="z-40 text-sm max-md:text-xl font-base w-1/2 max-md:w-3/4 text-gray-500 text-center hover:text-gray-400">
                    <a
                        href="https://github.com/Jantomz/andromeda-ticket-3"
                        target="_blank"
                    >
                        View Github (documentation, source code, and more)
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
                    <h1 className="text-5xl max-md:text-3xl text-white text-center w-1/3 max-md:w-3/4 font-bold">
                        More Secure Tickets...
                    </h1>
                </div>
                <div className="h-[300px]"></div>
                <div className="flex flex-col max-md:flex-col justify-center items-center gap-4">
                    <h1 className="text-5xl max-md:text-3xl text-white text-center w-1/3 max-md:w-3/4 font-bold">
                        More Community-Owned Events...
                    </h1>
                    <ShowEventStats CW721Address={CW721EventsAddress} />
                </div>
                <div className="h-[300px]"></div>
                <div className="flex flex-col max-md:flex-col justify-center items-center gap-4">
                    <ShowShares SplitterAddress={SplitterAddress} />
                    <h1 className="text-5xl max-md:text-3xl text-white text-center w-1/3 max-md:w-3/4 font-bold">
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
                <div className="h-[300px]"></div>
                <div className="flex flex-col justify-center items-center gap-8 px-4 text-white">
                    <h1 className="text-5xl max-md:text-3xl text-left w-full max-md:w-3/4 font-bold">
                        Our Story: Ticket3
                    </h1>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        We were once a small, passionate team of developers,
                        driven by a single goal: to solve the widespread issue
                        of ticket fraud in small events. We understood the
                        frustration of event organizers and patrons alike,
                        knowing that secure, one-of-a-kind tickets were a rarity
                        in an industry plagued with counterfeits. This challenge
                        sparked an idea—an idea to bring the power of Web3 to
                        the ticketing world. And that's how Ticket3 was born.
                    </p>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        In our mission to create a more secure and transparent
                        way to host and manage tickets, we realized that the use
                        of blockchain technology could make the ticketing
                        process not only safer but also more efficient. Thus,
                        Ticket3 isn’t just a platform; it's a revolution in how
                        events are managed, and how patrons trust their tickets.
                    </p>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        But we knew we couldn’t do this alone. We wanted to
                        provide a seamless experience for both event organizers
                        and attendees, and to do so, we needed to integrate Web3
                        tools to ensure authenticity. To begin with, the heart
                        of this system revolves around the{" "}
                        <strong>Keplr Wallet</strong>—your personal gateway to
                        the blockchain.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        1. Connect Your Keplr Wallet
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        First things first, in order to fully enjoy the benefits
                        of Ticket3, you'll need to connect your{" "}
                        <strong>Keplr Wallet</strong>. This is how you’ll
                        interact with the blockchain. Be sure to set it to the{" "}
                        <strong>Andromeda Testnet</strong>. You’ll know you’re
                        connected when the network indicator appears in the
                        navbar. Once connected, you’re ready to explore all the
                        functionality Ticket3 has to offer.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        2. Initial Setup
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        The full potential of the app becomes available only
                        after you’ve connected your wallet. This is your
                        personal space to manage your tickets, events, and
                        shares. So, ensure your wallet is connected before you
                        continue with the rest of the features.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        3. App Stability Warning
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        A quick note: while we're making great strides with
                        Ticket3, the app is still in active development. We’ve
                        done our best to build thorough error handling, but{" "}
                        <strong>malicious attack protection</strong> isn’t yet
                        fully implemented. For now, please use the app with
                        caution and be patient with transaction processing—some
                        features may take a moment to load or update, but rest
                        assured, the system is working to make sure everything
                        is safe and secure.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        4. Browse Events
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        Once you're ready, head over to the{" "}
                        <strong>Events</strong> tab to browse a list of
                        available events. Here, you can check out upcoming
                        events, explore their details, and decide where you'd
                        like to be part of the action. This is the starting
                        point for attendees and admins alike.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        5. For Admins: Manage Tickets
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        For event <strong>admins</strong>, you get special
                        control over your events. On the event info page, you'll
                        be able to view all the sellable tickets for your event.
                        If you’re ready to let people purchase, you can send
                        those tickets to the marketplace where others can buy
                        them. This ensures that tickets are available for the
                        right people, at the right time.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        6. Purchasing Tickets (For Users)
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        If you're a <strong>patron</strong> looking to attend an
                        event, you can easily browse the event info page and
                        find the option to <strong>buy tickets</strong>. Simply
                        select your desired ticket type and proceed to checkout.
                        Whether you’re a first-time user or a seasoned attendee,
                        purchasing your ticket will always be a secure and
                        seamless process.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        7. Events Wallet
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        Once you’ve made your purchases, head to the{" "}
                        <strong>Events Wallet</strong> tab. This is where your
                        tickets are stored. It's like your personal event ticket
                        vault, ensuring easy access whenever you need it. No
                        more scrambling for email confirmations or printing
                        paper tickets—your tickets are right there, secured on
                        the blockchain.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        8. Proof of Attendance
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        For <strong>admins</strong>, there’s an extra layer of
                        verification available: the{" "}
                        <strong>Proof of Attendance</strong> feature. You can
                        generate a unique <strong>QR code</strong> for each
                        attendee, which can be scanned to confirm their presence
                        at the event. This provides a decentralized way to
                        verify attendees and enhances security for both the
                        organizer and the guest.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        9. Ticket3 Shares
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        But we didn’t stop at just ticketing. We wanted to bring{" "}
                        <strong>ownership</strong> into the mix. Enter{" "}
                        <strong>Ticket3 Shares</strong>—an innovative way to
                        distribute ownership of an event’s success. Once your
                        shares are loaded, you’ll be able to:
                        <ul className="list-disc list-inside">
                            <li>View how many shares you own.</li>
                            <li>
                                See the distribution of shares among all
                                shareholders.
                            </li>
                            <li>
                                Purchase more shares to increase your stake in
                                the event.
                            </li>
                        </ul>
                        This allows people to be part-owners of events, sharing
                        in both the risks and rewards.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        10. Admin Controls: Managing Events & Shares
                    </h3>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        For <strong>admins</strong>, we’ve included powerful
                        tools to help you create and manage events. You’ll be
                        able to:
                        <ul className="list-disc list-inside">
                            <li>
                                <strong>Create new events</strong> from scratch.
                            </li>
                            <li>
                                <strong>Mint new shares</strong> to distribute
                                ownership.
                            </li>
                            <li>
                                <strong>Send shares to the marketplace</strong>{" "}
                                (one by one, for more control).
                            </li>
                            <li>
                                <strong>
                                    Update shares for profit splitting
                                </strong>
                                , ensuring the right distribution among
                                shareholders.
                            </li>
                        </ul>
                        These features empower admins to maintain control while
                        giving the community a stake in their events.
                    </p>
                    <h3 className="text-3xl max-md:text-2xl font-semibold w-full max-md:w-3/4">
                        Important Notes for Admins:
                    </h3>
                    <ul className="list-disc list-inside text-lg max-md:text-base w-full max-md:w-3/4">
                        <li>
                            Shares can only be minted once for each event at
                            this stage. This ensures that the original
                            allocation of shares is preserved.
                        </li>
                        <li>
                            When sending tickets or shares to the marketplace,{" "}
                            <strong>only one at a time</strong> can be listed.
                            This is intentional to{" "}
                            <strong>prevent marketplace flooding</strong> and
                            give you control over the distribution process.
                        </li>
                        <li>
                            Remember,{" "}
                            <strong>
                                updating shares is crucial for profit splitting
                            </strong>
                            . Once shares are updated, all ticket purchases will
                            be <strong>split among shareholders</strong> as per
                            the updated distribution.
                        </li>
                    </ul>
                    <p className="text-lg max-md:text-base w-full max-md:w-3/4">
                        All of these features come together to create a better,
                        more secure way of managing events and tickets in the
                        digital age. By leveraging the power of blockchain,
                        we're not just reducing fraud; we’re building a more
                        trustworthy, transparent ticketing ecosystem for
                        everyone—organizers, attendees, and even shareholders.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Page;
