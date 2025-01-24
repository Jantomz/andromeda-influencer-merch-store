import React, { FC } from "react";

interface Props {}

const PoweredByLogo: FC<Props> = (props) => {
    const {} = props;
    return (
        <a
            href="https://www.andromedaprotocol.io/"
            target="_blank"
            rel="noopener noreferrer"
        >
            <div className="fixed left-2 bottom-2 max-w-fit pl-1.5 pr-3 py-1 rounded-lg flex items-center space-x-1 bg-gray-900">
                <img src="/logo.png" className="h-6" alt="Andromeda Logo" />
                <span className="text-sm text-white">Powered by Andromeda</span>
            </div>
        </a>
    );
};

export default PoweredByLogo;
