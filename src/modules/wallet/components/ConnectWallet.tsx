"use client";
import React, { FC } from "react";
import { PlusIcon } from "@heroicons/react/solid";
import Connected from "./Connected";
import useAndromedaClient from "@/lib/andrjs/hooks/useAndromedaClient";
import { connectAndromedaClient, useAndromedaStore } from "@/zustand/andromeda";

interface ConnectWalletProps {}
const ConnectWallet: FC<ConnectWalletProps> = (props) => {
    const {} = props;
    const { isLoading } = useAndromedaStore();
    const client = useAndromedaClient();
    if (client) {
        return <Connected />;
    }
    return (
        <button
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={() => connectAndromedaClient()}
            disabled={isLoading}
        >
            <PlusIcon className="h-5 w-5 mr-2" />
            {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
    );
};
export default ConnectWallet;
