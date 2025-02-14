import { Flex, Text, VStack, Box, Heading, HStack, Image, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { get_user_profile_data } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";

const UserProfile = () => {

    const get_username_from_url = () => {
        const url_split = window.location.pathname.split('/');
        return url_split[url_split.length - 1];
    }

    const [username, setUsername] = useState(get_username_from_url());

    useEffect(() => {
        setUsername(get_username_from_url());
    }, [])

    return (
        <Flex w='100%' justifyContent='center'>
            <VStack w='75%'>
                <Box w='100%' mt='40px'>
                    <UserDetails username={username} />
                </Box>
            </VStack>
        </Flex>
    )
}

const UserDetails = ({ username }) => {

    const [loading, setLoading] = useState(true)
    const [bio, setBio] = useState('')
    const [profileImage, setProfileImage] = useState('')
    const [followerCount, setFollowerCount] = useState('')
    const [followingCount, setFollowingCount] = useState('')

    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = await get_user_profile_data(username);
                setBio(data.bio)
                setProfileImage(data.profile_image)
                setFollowerCount(data.follower_count)
                setFollowingCount(data.following_count)
            } catch {
                console.log('error')
            } finally {
                setLoading(false)
            }
        }
        fetchData()

    }, [])

    return (
        <VStack alignItems='start' w='100%' gap='40px'>
            <Heading>@{username}</Heading>
            <HStack gap='20px'>
                <Box boxSize='150px' border='2px solid' borderColor='gray.700' bg='white' borderRadius='full' overflow='hidden'>
                    <Image src={loading ? '' : `${SERVER_URL}${profileImage}`} boxSize='100%' objectFit='cover' />
                </Box>
                <VStack gap='20px'>
                    <HStack gap='20px' fontSize='18px'>
                        <VStack>
                            <Text>Followers</Text>
                            <Text>{loading ? '-' : followerCount}</Text>
                        </VStack>
                        <VStack>
                            <Text>Following</Text>
                            <Text>{loading ? '-' : followingCount}</Text>
                        </VStack>
                    </HStack>
                    <Button w='100%'>Edit Profile</Button>
                </VStack>
            </HStack>
            <Text fontSize='18px'>{loading ? '-' : bio}</Text>
        </VStack>
    )
}

export default UserProfile