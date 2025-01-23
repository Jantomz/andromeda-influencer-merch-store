import Layout from "@/modules/general/components/Layout";
import { PurchaseShares } from "@/modules/marketplace/components";
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
            <PurchaseShares
                CW721SharesAddress="andr1qhndf3kcpqxqxc33p042wae6d95svr5an292wt765n8jxq2wccgq0vyldt"
                MarketplaceAddress="andr1ld0mdudnnkt9vh8zcwqt0a6qc8wvmjh927j8y8kjy6zcn0skhdds78pkd5"
                OwnerAddress="andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx"
            />
        </Center>
    );
};

export default Page;
