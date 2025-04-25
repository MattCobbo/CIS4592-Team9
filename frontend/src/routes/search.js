import { Flex, VStack, HStack, Heading, Text, Box, Image, Button, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { search_users, search_organizations, joinOrganization, getUserOrganizations } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";
import { useNavigate } from "react-router-dom";

const Search = () => {
    const [searchValue, setSearchValue] = useState('');
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [userOrgs, setUserOrgs] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const fetchUserOrganizations = async () => {
        try {
            const userOrganizations = await getUserOrganizations();
            // Map to just the organization IDs for easy checking
            setUserOrgs(userOrganizations.map(org => org.id));
        } catch (err) {
            console.error("Error fetching user organizations:", err);
        }
    }

    useEffect(() => {
        setSearchValue(get_search_value_from_url());
        setLoading(true);

        const loadAll = async () => {
            try {
                await Promise.all([fetchUsers(), fetchOrganizations(), fetchUserOrganizations()]);
            } catch (err) {
                console.error(err);
                alert("Error getting search query");
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [window.location.pathname]);

    return (
        <Flex w='100%' justifyContent='center' pt='50px'>
            <HStack alignItems='top' gap='80px'>
                <VStack>
                    <Heading>Organizations</Heading>
                    <VStack w='95%' maxW='500px' alignItems='center' gap='10px'>
                        <Text>{searchValue}</Text>
                        {loading ? (
                            <Text>Loading...</Text>
                        ) : organizations.length > 0 ? (
                            organizations.map((org) => (
                                <Organization
                                    key={org.id}
                                    name={org.name}
                                    profile_image={org.profile_image}
                                    owner_username={org.owner_username}
                                    id={org.id}
                                    isMember={userOrgs.includes(org.id)}
                                    refetchOrgs={fetchUserOrganizations}
                                    organization={org}
                                />
                            ))
                        ) : (
                            <Text>No organizations found</Text>
                        )}
                    </VStack>
                </VStack>

                <VStack>
                    <Heading>Users</Heading>
                    <VStack w='95%' maxW='500px' alignItems='center' gap='10px'>
                        <Text>{searchValue}</Text>
                        {loading ? (
                            <Text>Loading...</Text>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <UserProfile
                                    key={user.username}
                                    username={user.username}
                                    profile_image={user.profile_image}
                                    first_name={user.first_name}
                                    last_name={user.last_name}
                                />
                            ))
                        ) : (
                            <Text>No users found</Text>
                        )}
                    </VStack>
                </VStack>
            </HStack>
        </Flex>
    )
}

const UserProfile = ({ username, profile_image, first_name, last_name }) => {
    const nav = useNavigate();

    const handleNav = () => {
        nav(`/${username}`);
    }

    return (
        <HStack onClick={handleNav} p='10px' margin='10px' width='100%' minWidth='400px' border={'1px solid'} borderColor={'gray.400'} borderRadius={'8px'} cursor="pointer">
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

const Organization = ({ name, profile_image, owner_username, id, isMember, refetchOrgs, organization }) => {
    const nav = useNavigate();
    const toast = useToast();
    const [joining, setJoining] = useState(false);
    const [isLocalMember, setIsLocalMember] = useState(isMember);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const currentUsername = JSON.parse(localStorage.getItem('userData'))?.username || '';

    useEffect(() => {
        // Check if user has a pending request for this organization
        if (organization && organization.pending_requests) {
            setHasPendingRequest(organization.pending_requests.includes(currentUsername));
        }
    }, [organization]);

    const handleNav = () => {
        nav(`/organization/${id}`);
    }

    const handleJoin = async (e) => {
        e.stopPropagation(); // Prevent navigation when clicking the button

        if (isLocalMember) return; // Already a member

        setJoining(true);
        try {
            const response = await joinOrganization(id);

            toast({
                title: "Success",
                description: "Your request to join this organization has been sent",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Update local state
            setIsLocalMember(true);

            // Refetch user's organizations to update the parent component's state
            if (refetchOrgs) refetchOrgs();

        } catch (error) {
            console.error("Join error:", error);

            // Show the specific error message if available
            const errorMessage = error.response?.data?.error || "Could not process your join request";

            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setJoining(false);
        }
    }

    return (
        <HStack p='10px' margin='10px' width='100%' minWidth='400px' border={'1px solid'} borderColor={'gray.400'} borderRadius={'8px'}>
            <Flex width="100%" onClick={handleNav} cursor="pointer">
                <Box boxSize='60px' border='1px solid' borderColor='gray.700' bg='white' borderRadius='full' overflow='hidden'>
                    <Image src={`${SERVER_URL}${profile_image}`} boxSize='100%' objectFit='cover' />
                </Box>
                <VStack alignItems={'left'} gap={''} marginLeft="10px" marginBottom={'10px'} flex="1">
                    <Heading size={'h2'}>@{name}</Heading>
                    <Text fontSize={'12px'}>Owner: {owner_username}</Text>
                </VStack>
            </Flex>

            {!isLocalMember && !hasPendingRequest && (
                <Button
                    onClick={handleJoin}
                    colorScheme="blue"
                    size="sm"
                    isLoading={joining}
                    loadingText="Joining"
                >
                    Join
                </Button>
            )}

            {!isLocalMember && hasPendingRequest && (
                <Button
                    colorScheme="yellow"
                    size="sm"
                    isDisabled={true}
                >
                    Pending
                </Button>
            )}

            {isLocalMember && (
                <Button
                    colorScheme="green"
                    size="sm"
                    variant="outline"
                    onClick={handleNav}
                >
                    View
                </Button>
            )}
        </HStack>
    )
}

export default Search