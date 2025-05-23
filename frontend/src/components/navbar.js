import { Flex, HStack, Text, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { IoPersonOutline, IoHomeOutline, IoSearchCircle, IoSettingsSharp, IoBriefcaseOutline } from "react-icons/io5";

const Navbar = () => {
    const [searchValue, setSearchValue] = useState('');
    const nav = useNavigate();

    const handleNavigate = (route) => {
        setSearchValue('');
        nav(`/${route}`);
    }

    const handleNavigateUser = () => {
        const username = JSON.parse(localStorage.getItem('userData'))['username'];
        nav(`/${username}`);
        window.location.reload();
    }

    return (
        <Flex w='100vw' h='90px' bg='yellow.600' justifyContent='center' alignItems='center'>
            <HStack w='90%' justifyContent='space-between' color='white'>
                <Text fontSize='24px' fontWeight='bold'>LFG</Text>
                <HStack gap={'20px'}>
                    <InputGroup>
                        <Input value={searchValue} placeholder='Search for user' _placeholder={{ color: 'silver' }}
                            onChange={(e) => setSearchValue(e.currentTarget.value)}
                            onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    handleNavigate(`search/${searchValue}`)
                                    if (searchValue === '') { handleNavigate('') }
                                }
                            }} />
                        <InputRightElement>
                            <IoSearchCircle size='30px' onClick={() => {
                                handleNavigate(`search/${searchValue}`)
                                if (searchValue === '') { handleNavigate('') }
                            }} />
                        </InputRightElement>
                    </InputGroup>

                    {/* Existing links */}
                    <Text onClick={() => handleNavigate('about')}>About.us</Text>

                    {/* Organizations link */}
                    <Text onClick={() => handleNavigate('organizations')}>Organizations</Text>

                    {/* New Job Board link */}
                    <Text onClick={() => handleNavigate('jobs')}>
                        <HStack spacing={1}>
                            <IoBriefcaseOutline size='22px' />
                            <Text>Jobs</Text>
                        </HStack>
                    </Text>

                    {/* Home Icon */}
                    <Text onClick={() => handleNavigate('')}><IoHomeOutline size='22px' /></Text>

                    {/* User Profile Icon */}
                    <Text onClick={handleNavigateUser}><IoPersonOutline size='22px' /></Text>
                    <Text onClick={(route) => handleNavigate('settings')}><IoSettingsSharp size='22px' /></Text>
                </HStack>
            </HStack>
        </Flex>
    );
};

export default Navbar;
