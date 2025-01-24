"use client"; // Ensures this component is rendered on the client side

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"; // Importing navigation menu components for better modularity
import { OwnerAddress } from "@/ContractAddresses"; // Importing the owner address for conditional rendering

import { ConnectWallet } from "@/modules/wallet"; // Importing the ConnectWallet component for wallet connection functionality
import { useAndromedaStore } from "@/zustand/andromeda"; // Importing Zustand store for state management
import Link from "next/link"; // Using Next.js Link for client-side navigation
import React from "react"; // Importing React for JSX support

interface Props {} // Defining Props interface for potential future use

const navigationMenuTriggerStyle = () => `
    bg-black text-white px-4 py-2 rounded-md
    hover:bg-gray-800
`; // Defining a function for navigation menu link styles for reusability

const Navbar = (props: Props) => {
    const { accounts } = useAndromedaStore(); // Accessing accounts from Zustand store
    const account = accounts[0]; // Getting the first account
    const address = account?.address ?? ""; // Safely accessing the address
    const truncatedAddress =
        address.slice(0, 6) + "......" + address.slice(address.length - 4); // Truncating the address for display

    return (
        <div className="p-4 z-40 mt-3">
            {" "}
            {/* Adding padding, z-index, and margin-top for styling */}
            <NavigationMenu className="mx-auto">
                {" "}
                {/* Centering the navigation menu */}
                <NavigationMenuList className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {" "}
                    {/* Flexbox for responsive layout */}
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            {/* Using legacyBehavior for backward compatibility */}
                            <img
                                src="/Ticket3_Logo.png"
                                alt="Ticket3 Logo"
                                className="w-[40px] h-[40px]" // Setting width and height for the logo
                            />
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()} // Applying styles to the link
                            >
                                Home
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/events" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Events
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/event-wallet" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Event Wallet
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/join-shares" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Get Ticket3 Shares
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    {address === OwnerAddress && ( // Conditionally rendering Admin link for the owner
                        <NavigationMenuItem>
                            <Link href="/admin" legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}
                                >
                                    Admin
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    )}
                    <NavigationMenuItem>
                        <ConnectWallet />{" "}
                        {/* Rendering the ConnectWallet component */}
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
};

export default Navbar; // Exporting the Navbar component as default
