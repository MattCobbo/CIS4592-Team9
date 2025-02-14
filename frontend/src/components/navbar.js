import { Flex, HStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { IoPersonOutline } from "react-icons/io5"

const Navbar = () => {

    const nav = useNavigate();

    const handleNavigate = (route) => {
        nav(`/${route}`)
    }

    return (
        <Flex w='100vw' h='90px' bg='yellow.600' justifyContent='center' alignItems='center'>
            <HStack w='90%' justifyContent='space-between' color='white'>
                <Text fontSize='24px' fontWeight='bold'>ArtCade</Text>
                <HStack>
                    <Text onClick={(route) => handleNavigate('admin')}><IoPersonOutline size='22px' /></Text>
                </HStack>
            </HStack>
        </Flex>
    )
}

export default Navbar;