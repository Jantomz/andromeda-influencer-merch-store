"use client"; // This directive is used to indicate that this file should be treated as a client-side component.
import React, { FC, ReactNode } from "react"; // Importing necessary React types and functions.
import Navbar from "./Navbar"; // Importing the Navbar component.
import PoweredByLogo from "@/modules/ui/PoweredByLogo"; // Importing the PoweredByLogo component.
import { Toaster } from "@/components/ui/toaster"; // Importing the Toaster component for notifications.

interface LayoutProps {
    children?: ReactNode; // Defining the type for children prop to allow any valid React node.
}

const Layout: FC<LayoutProps> = (props) => {
    const { children } = props; // Destructuring children from props for easier access.

    return (
        <div className="min-h-screen flex flex-col">
            {" "}
            {/* Ensuring the layout takes the full height of the screen and uses flexbox for layout. */}
            <Navbar /> {/* Including the Navbar at the top of the layout. */}
            <hr className="my-4" />{" "}
            {/* Adding a horizontal rule for visual separation. */}
            <div className="flex-grow px-4 py-4 w-3/4 mx-auto">
                {" "}
                {/* Making the main content area flexible and responsive. */}
                {children}{" "}
                {/* Rendering the children passed to the Layout component. */}
            </div>
            <footer className="mt-8 text-center text-white">
                {" "}
                {/* Styling the footer and centering its content. */}
                Created with <span className="text-red-500">❤️</span> by{" "}
                {/* Adding a heart icon for a personal touch. */}
                <a
                    href="https://github.com/jantomz"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-blue-500"
                >
                    Jaden Zhang{" "}
                    {/* Providing a link to the author's GitHub profile. */}
                </a>
            </footer>
            <PoweredByLogo />{" "}
            {/* Including the PoweredByLogo component at the bottom. */}
            <Toaster />{" "}
            {/* Including the Toaster component for displaying notifications. */}
        </div>
    );
};

export default Layout; // Exporting the Layout component as the default export.
