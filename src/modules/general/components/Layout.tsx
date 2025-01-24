"use client";
import React, { FC, ReactNode } from "react";
import Navbar from "./Navbar";
import PoweredByLogo from "@/modules/ui/PoweredByLogo";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
    children?: ReactNode;
}
const Layout: FC<LayoutProps> = (props) => {
    const { children } = props;

    return (
        <div className="min-h-screen">
            <div>
                <Navbar />
            </div>
            <hr className="my-4" />
            <div className="px-6 py-4 w-3/4 mx-auto">{children}</div>
            <footer className="mt-8 text-center text-white">
                Created with <span className="text-red-500">❤️</span> by{" "}
                <a
                    href="https://github.com/jantomz"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-blue-500"
                >
                    Jaden Zhang
                </a>
            </footer>
            <PoweredByLogo />
            <Toaster />
        </div>
    );
};
export default Layout;
