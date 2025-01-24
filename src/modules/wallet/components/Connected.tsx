import useQueryChain from "@/lib/graphql/hooks/chain/useChainConfig";
import {
    disconnectAndromedaClient,
    useAndromedaStore,
} from "@/zustand/andromeda";
import {
    ChevronDownIcon,
    XCircleIcon,
    ExternalLinkIcon,
} from "@heroicons/react/outline";
import React, { FC, useState } from "react";

interface ConnectedProps {}
const Connected: FC<ConnectedProps> = (props) => {
    const {} = props;
    const { accounts, chainId } = useAndromedaStore();
    const account = accounts[0];
    const { data: config } = useQueryChain(chainId);
    const address = account?.address ?? "";
    const truncatedAddress =
        address.slice(0, 6) + "......" + address.slice(address.length - 4);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const togglePopover = () => {
        setIsPopoverOpen(!isPopoverOpen);
    };

    return (
        <div className="relative z-40">
            <div className="relative">
                <button
                    onClick={togglePopover}
                    className="flex items-center px-4 py-2 border border-gray-200 bg-black text-white rounded-lg hover:border-primary-600 hover:bg-gray-800 active:bg-gray-900"
                >
                    <div className="flex items-center mr-2">
                        <img src={config?.iconUrls?.sm ?? ""} className="w-5" />
                        <span className="ml-2 text-md">{truncatedAddress}</span>
                        <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs ${config?.chainType === "mainnet" ? "bg-green-500" : "bg-purple-500"}`}
                        >
                            {config?.chainType}
                        </span>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-white" />
                </button>
                {isPopoverOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-black border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <img
                                        src={config?.iconUrls?.sm ?? ""}
                                        className="w-5"
                                    />
                                    <span className="ml-2 font-semibold text-white">
                                        {config?.chainName ?? config?.chainId}
                                    </span>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${config?.chainType === "mainnet" ? "bg-green-500" : "bg-purple-500"}`}
                                >
                                    {config?.chainType}
                                </span>
                            </div>
                            <input
                                value={account?.address ?? ""}
                                readOnly
                                className="w-full mb-2 p-2 text-sm text-white bg-black border border-gray-200 rounded-lg"
                            />
                            <div className="flex space-x-2">
                                <a
                                    href={config?.blockExplorerAddressPages[0]?.replaceAll(
                                        "${address}",
                                        account?.address ?? ""
                                    )}
                                    target="_blank"
                                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white border border-gray-200 rounded-lg hover:bg-gray-600"
                                >
                                    <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                    Explorer
                                </a>
                                <button
                                    onClick={disconnectAndromedaClient}
                                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                                >
                                    <XCircleIcon className="w-2 h-2 mr-2" />
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Connected;
