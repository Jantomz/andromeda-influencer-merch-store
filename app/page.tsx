import Layout from "@/modules/general/components/Layout";
import { Center, Image, Link, Text, VStack } from "@chakra-ui/react";
import React from "react";

interface Props {}

const Page = async (props: Props) => {
    return (
        <Center minH="100vh">
            <VStack spacing={3}>
                <Image src="/logo.png" w="6rem" />
                <Text fontSize="3xl" fontWeight="bold">
                    Andromeda Nextjs Starter Template
                </Text>
                <Text>
                    Click button to connect <b>Andromeda Devnet</b>.
                </Text>
                <Text fontWeight="light" mb="6">
                    Learn more about Andromeda&nbsp;
                    <Link
                        isExternal
                        href="https://docs.andromedaprotocol.io"
                        color="blue"
                        textDecoration="underline"
                    >
                        here
                    </Link>
                </Text>
            </VStack>
        </Center>
    );
};

export default Page;
