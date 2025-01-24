import React, { ReactNode } from "react";
import Providers from "./providers";
import { Metadata } from "next";
import "@/styles/globals.css";
import Layout from "@/modules/general/components/Layout";

export const metadata: Metadata = {
    title: {
        default: "Andromeda Nextjs Starter",
        template: "%s | App Name",
    },
};

interface Props {
    children?: ReactNode;
}

const RootLayout = async (props: Props) => {
    const { children } = props;

    return (
        <html lang="en">
            <body>
                <Providers>
                    <Layout>{children}</Layout>
                </Providers>
            </body>
        </html>
    );
};

export default RootLayout;
