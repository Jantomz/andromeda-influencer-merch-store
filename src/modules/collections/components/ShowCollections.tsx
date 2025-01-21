"use client";
import { Button } from "@chakra-ui/react";
import React, { FC, useEffect } from "react";
import { PlusSquareIcon } from "@chakra-ui/icons";
import {
    useExecuteContract,
    useQueryContract,
    useSimulateExecute,
} from "@/lib/andrjs";

interface ConnectWalletProps {
    address: string;
}
const ShowCollections: FC<ConnectWalletProps> = (props) => {
    const { address } = props;

    const query = useQueryContract(address);
    const execute = useExecuteContract(address);
    const simulate = useSimulateExecute(address);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const result = await query({ all_tokens: {} });
                const result = await simulate(
                    {
                        mint: {
                            extension: {
                                publisher:
                                    "andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx",
                            },
                            token_id: "1",
                            owner: "andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx",
                        },
                    },
                    [{ denom: "uandr", amount: "500000" }]
                );

                execute(
                    {
                        mint: {
                            token_id: "1",
                            extension: {
                                publisher:
                                    "andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx",
                            },
                            owner: "andr1eq2npynjfyx52utu34kht3p5vhp3yflt4qr2gx",
                        },
                    },
                    {
                        amount: [
                            {
                                denom: result.amount[0].denom,
                                amount: result.amount[0].amount,
                            },
                        ],
                        gas: result.gas,
                    }
                );
                console.log(result);
            } catch (error) {
                console.error("Error querying contract:", error);
            }
        };

        fetchData();
    }, [query]);

    return (
        <Button leftIcon={<PlusSquareIcon boxSize={5} />} colorScheme="purple">
            HI
        </Button>
    );
};
export default ShowCollections;
