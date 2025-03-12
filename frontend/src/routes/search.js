import { Flex, VStack, HStack, Heading, Text, Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { search_users } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";
import { useNavigate } from "react-router-dom";

const Search = () => {

    const get_search_value_from_url = () => {
        const url_split = window.location.pathname.split('/search/');
        return url_split[url_split.length - 1];
    }

    const handleSearch = async () => {
        try {
            const users = await search_users(searchValue);
            setUsers(users);
        } catch {

        }
    }

    const [searchValue, setSearchValue] = useState(get_search_value_from_url());
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        setSearchValue(get_search_value_from_url());
    }, [])

    handleSearch();

    return (
        <Flex w='100%' justifyContent='center' pt='50px'>
            <VStack>
                <Heading>Search Results</Heading>
                <VStack w='95%' maxW='500px' alignItems='center' gap='10px'>
                    <Text>{searchValue}</Text>
                    {
                        users.map((user) => {
                            return <UserProfile username={user.username} profile_image={user.profile_image} first_name={user.first_name} last_name={user.last_name}/>
                        })
                    }
                </VStack>
            </VStack>
        </Flex>
    )
}

const UserProfile = ({username, profile_image, first_name, last_name}) => {
    
    const nav = useNavigate()

    const handleNav = () => {
        nav(`/${username}`)
    }
    
    return (
        <HStack onClick={handleNav} p='10px' margin='10px' width='100%' minWidth='400px' border={'1px solid'} borderColor={'gray.400'} borderRadius={'8px'}>
            <Box boxSize='60px' border='1px solid' borderColor='gray.700' bg='white' borderRadius='full' overflow='hidden'>
                <Image src={`${SERVER_URL}${profile_image}`} boxSize='100%' objectFit='cover' />
            </Box>
            <VStack alignItems={'left'} gap={''} marginBottom={'10px'}>
                <Heading size={'h2'}>@{username}</Heading>
                <Text fontSize={'12px'}>{first_name} {last_name}</Text>
            </VStack>
        </HStack>
    )
}

export default Search