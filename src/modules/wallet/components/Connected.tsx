import useQueryChain from "@/lib/graphql/hooks/chain/useChainConfig";
import {
    disconnectAndromedaClient,
    useAndromedaStore,
} from "@/zustand/andromeda";
import { ChevronDownIcon, CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
    Badge,
    Button,
    HStack,
    Image,
    Input,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import React, { FC } from "react";

interface ConnectedProps {}
const Connected: FC<ConnectedProps> = (props) => {
    const {} = props;
    const { accounts, chainId } = useAndromedaStore();
    const account = accounts[0];
    const { data: config } = useQueryChain(chainId);
    const address = account?.address ?? "";
    const truncatedAddress =
        address.slice(0, 6) + "......" + address.slice(address.length - 4);
    const { colorMode } = useColorMode();
    const bgColor = useColorModeValue("black", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.100");
    const textColor = useColorModeValue("white", "white");

    return (
        <div className="z-40">
            <Popover placement="bottom-end">
                {({ isOpen }) => (
                    <>
                        <PopoverTrigger>
                            <Button
                                variant="outline"
                                size="lg"
                                borderColor={
                                    isOpen ? "primary.600" : borderColor
                                }
                                bg={bgColor}
                                _hover={{ borderColor: "primary.600" }}
                            >
                                <HStack mr="2">
                                    <Image
                                        src={config?.iconUrls?.sm ?? ""}
                                        w="5"
                                    />
                                    <Text fontSize="md" color={textColor}>
                                        {truncatedAddress}
                                    </Text>
                                    <Badge
                                        colorScheme={
                                            config?.chainType === "mainnet"
                                                ? "green"
                                                : "purple"
                                        }
                                        fontSize={8}
                                        py="1"
                                        rounded="full"
                                    >
                                        {config?.chainType}
                                    </Badge>
                                </HStack>
                                <ChevronDownIcon boxSize={4} color="white" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            bg={bgColor}
                            borderColor={borderColor}
                            zIndex="40"
                        >
                            <PopoverBody>
                                <VStack mb={3} alignItems="start">
                                    <HStack
                                        w="full"
                                        justifyContent="space-between"
                                    >
                                        <HStack>
                                            <Image
                                                src={config?.iconUrls?.sm ?? ""}
                                                w="5"
                                            />
                                            <Text
                                                fontWeight={600}
                                                color={textColor}
                                            >
                                                {config?.chainName ??
                                                    config?.chainId}
                                            </Text>
                                        </HStack>
                                        <Badge
                                            colorScheme={
                                                config?.chainType === "mainnet"
                                                    ? "green"
                                                    : "purple"
                                            }
                                            fontSize={8}
                                            py="1"
                                            rounded="full"
                                        >
                                            {config?.chainType}
                                        </Badge>
                                    </HStack>
                                    <Input
                                        value={account?.address ?? ""}
                                        mb={2}
                                        p={2}
                                        color={textColor}
                                        fontSize="sm"
                                        readOnly
                                        bg={useColorModeValue("black", "black")}
                                    />
                                    <HStack w="full">
                                        <Button
                                            as="a"
                                            href={config?.blockExplorerAddressPages[0]?.replaceAll(
                                                "${address}",
                                                account?.address ?? ""
                                            )}
                                            target="_blank"
                                            leftIcon={
                                                <ExternalLinkIcon boxSize={4} />
                                            }
                                            variant="outline"
                                            fontWeight={500}
                                            color={textColor}
                                            w="full"
                                            size="sm"
                                            _hover={{
                                                bg: useColorModeValue(
                                                    "gray.200",
                                                    "gray.600"
                                                ),
                                            }}
                                        >
                                            Explorer
                                        </Button>
                                        <Button
                                            leftIcon={<CloseIcon boxSize={2} />}
                                            onClick={disconnectAndromedaClient}
                                            fontWeight={500}
                                            colorScheme="red"
                                            w="full"
                                            size="sm"
                                        >
                                            Disconnect
                                        </Button>
                                    </HStack>
                                </VStack>
                            </PopoverBody>
                        </PopoverContent>
                    </>
                )}
            </Popover>
        </div>
    );
};
export default Connected;
