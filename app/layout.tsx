import React, { ReactNode } from "react";
import Providers from "./providers";
import { Metadata } from "next";
import "@/styles/globals.css";
import { Layout } from "@/modules/general";

export const metadata: Metadata = {
    title: {
        default: "Ticket 3",
        template: "%s App",
    },
};

interface Props {
    children?: ReactNode;
}

const RootLayout = async (props: Props) => {
    const { children } = props;

    return (
        <html lang="en" className="dark">
            <body>
                <Providers>
                    <Layout>{children}</Layout>
                </Providers>
            </body>
        </html>
    );
};

export default RootLayout;
