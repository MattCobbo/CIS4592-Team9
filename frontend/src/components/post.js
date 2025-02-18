import { VStack, Text, HStack, Box, Image, Heading, Center, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { SERVER_URL } from "../constants/constants";
import { get_user_profile_data } from "../api/endpoints";

import { SlGameController } from "react-icons/sl";

const Post = ({ username, description, formatted_date, like_count, likes }) => {

    const [loading, setLoading] = useState(true)
    const [profileImage, setProfileImage] = useState('')
    const [followerCount, setFollowerCount] = useState('')

    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = await get_user_profile_data(username);
                setProfileImage(data.profile_image)
                setFollowerCount(data.follower_count)
            } catch {
                console.log('error')
            } finally {
                setLoading(false)
            }
        }
        fetchData()

    }, [])

    return (
        <VStack width='400px' border={'1px solid'} bgColor={'gray.50'} borderColor={'gray.400'} borderRadius={'8px'}>
            <HStack flex='1' marginTop='10px' width='100%' borderBottom={'1px solid'} borderColor={'gray.400'}>
                <Box boxSize='60px' marginLeft='25px' marginBottom='10px' border='1px solid' borderColor='gray.700' bg='white' borderRadius='full' overflow='hidden'>
                    <Image src={loading ? '' : `${SERVER_URL}${profileImage}`} boxSize='100%' objectFit='cover' />
                </Box>
                <VStack alignItems={'left'} gap={''} marginBottom={'10px'}>
                    <Heading size={'h2'}>@{username}</Heading>
                    <Text fontSize={'12px'}>Followers : {loading ? '-' : followerCount}</Text>
                    <Text fontSize={'12px'}>{loading ? '-' : formatted_date}</Text>
                </VStack>
            </HStack>
            <Text marginTop={'10px'} marginBottom={'10px'} justifyContent={'center'}>{loading ? '-' : description}</Text>
            <HStack flex='1' marginBottom='10px' width='100%' borderTop={'1px solid'} borderColor={'gray.400'}>
                <Text marginLeft='55px' marginTop='10px' fontSize={'14px'}>Likes : {loading ? '-' : like_count}</Text>
                <Box marginLeft={'150px'} marginTop={'10px'}>
                    <SlGameController size={'20px'} color="green" />
                </Box>
                <Button size={'20px'} marginTop={'10px'} marginLeft={'10px'} bgColor={'white'} textColor={'red.500'}>Report</Button>
            </HStack>
        </VStack>
    )
}

export default Post