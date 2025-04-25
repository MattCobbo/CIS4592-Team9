import { Button, Flex, FormControl, FormLabel, Heading, Input, Textarea, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { update_user, logout } from "../api/endpoints"
import { useNavigate } from "react-router-dom"

const Settings = () => {

    const storage = JSON.parse(localStorage.getItem('userData'))

    const [username, setUsername] = useState(storage ? storage.username : '')
    const [email, setEmail] = useState(storage ? storage.email : '')
    const [firstName, setFirstName] = useState(storage ? storage.first_name : '')
    const [lastName, setLastName] = useState(storage ? storage.last_name : '')
    const [bio, setBio] = useState(storage ? storage.bio : '')
    const [profileImage, setProfileImage] = useState(storage ? storage.profile_image : '')

    const nav = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            nav('/login')
        } catch {
            alert('error logging out')
        }
    }

    const handleUpdate = async () => {
        try {
            await update_user({ "username": username, "profile_image": profileImage, "email": email, "first_name": firstName, "last_name": lastName, "bio": bio })
            localStorage.setItem("userData", JSON.stringify({ "username": username, "email": email, "first_name": firstName, "last_name": lastName, "bio": bio }))
            alert("successfully updated")
            nav(`/${username}`)
        } catch {
            alert("error updating details")
        }
    }

    return (
        <Flex w='100%' h='calc(100vh - 90px)' justifyContent={'center'} alignItems={'center'}>
            <VStack alignItems='start' w='95%' maxW='400px' gap='30px'>
                <Heading>Settings</Heading>
                <FormControl>
                    <FormLabel>Profile Picture</FormLabel>
                    <Input onChange={(e) => setProfileImage(e.target.files[0])} bg='white' type='file' alignContent={'center'} />
                </FormControl>
                <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input onChange={(e) => setUsername(e.target.value)} value={username} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input onChange={(e) => setEmail(e.target.value)} value={email} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input onChange={(e) => setFirstName(e.target.value)} value={firstName} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input onChange={(e) => setLastName(e.target.value)} value={lastName} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>Bio</FormLabel>
                    <Textarea onChange={(e) => setBio(e.target.value)} value={bio} bg='white' type='text' />
                </FormControl>
                <Button onClick={handleUpdate} w='40%' colorScheme="blue" fontSize={'15px'} mt='20px'>Save Changes</Button>
                <Button onClick={handleLogout} colorScheme="red" fontSize={'15px'}>Logout</Button>
            </VStack>
        </Flex>
    )
}

export default Settings