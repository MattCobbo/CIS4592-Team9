import { Flex, VStack, HStack, Heading, Text, Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { search_users, search_organizations } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";
import { useNavigate } from "react-router-dom";

const Search = () => {

    const get_search_value_from_url = () => {
        const url_split = window.location.pathname.split('/search/');
        return url_split[url_split.length - 1];
    }

    const fetchUsers = async () => {
        try {
            const users = await search_users(searchValue);
            setUsers(users);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    }

    const fetchOrganizations = async () => {
        try {
            const organizations = await search_organizations(searchValue);
            setOrganizations(organizations);
        } catch (err) {
            console.error("Error fetching organizations:", err);
        }
    }

    const [searchValue, setSearchValue] = useState(get_search_value_from_url());
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        setSearchValue(get_search_value_from_url());

        const loadAll = async () => {
            try {
                await Promise.all([fetchUsers(), fetchOrganizations()]);  // ✅ Fetch data concurrently
            } catch (err) {
                console.error(err);
                alert("Error getting search query");
            } finally {

            }
        };

        loadAll();
    }, [])

    //fetchUsers();
    //fetchOrganizations();

    return (
        <Flex w='100%' justifyContent='center' pt='50px'>
            <HStack alignItems='top' gap='80px'>
                <VStack>
                    <Heading>Organizations</Heading>
                    <VStack w='95%' maxW='500px' alignItems='center' gap='10px'>
                        <Text>{searchValue}</Text>
                        {
                            organizations.map((org) => {
                                return <Organization name={org.name} profile_image={org.profile_image} owner={org.owner} id={org.id} />
                            })
                        }
                    </VStack>
                </VStack>

                <VStack>
                    <Heading>Users</Heading>
                    <VStack w='95%' maxW='500px' alignItems='center' gap='10px'>
                        <Text>{searchValue}</Text>
                        {
                            users.map((user) => {
                                return <UserProfile username={user.username} profile_image={user.profile_image} first_name={user.first_name} last_name={user.last_name} />
                            })
                        }
                    </VStack>
                </VStack>
            </HStack>
        </Flex>
    )
}

const UserProfile = ({ username, profile_image, first_name, last_name }) => {

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

const Organization = ({ name, profile_image, owner, id }) => {

    const nav = useNavigate()

    const handleNav = () => {
        nav(`/organization/${id}`)
    }

    return (
        <HStack onClick={handleNav} p='10px' margin='10px' width='100%' minWidth='400px' border={'1px solid'} borderColor={'gray.400'} borderRadius={'8px'}>
            <Box boxSize='60px' border='1px solid' borderColor='gray.700' bg='white' borderRadius='full' overflow='hidden'>
                <Image src={`${SERVER_URL}${profile_image}`} boxSize='100%' objectFit='cover' />
            </Box>
            <VStack alignItems={'left'} gap={''} marginBottom={'10px'}>
                <Heading size={'h2'}>@{name}</Heading>
                <Text fontSize={'12px'}>Owner: {owner}</Text>
            </VStack>
        </HStack>
    )
}

export default Search