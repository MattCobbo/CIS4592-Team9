import { Button, Flex, VStack, FormControl, FormLabel, Input, Heading, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const Login = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();
    const { auth_login } = useAuth();

    const handleLogin = () => {
        auth_login(username, password)
    }

    const handleNav = () => {
        navigate('/register')
    }

    return (
        <Flex w='100%' h='calc(100vh - 90px)' justifyContent={'center'} alignItems={'center'}>
            <VStack alignItems='start' w='95%' maxW='400px' gap='30px'>
                <Heading>Login</Heading>
                <FormControl>
                    <FormLabel htmlFor='username'>Username</FormLabel>
                    <Input onChange={(e) => setUsername(e.target.value)} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor='password'>Password</FormLabel>
                    <Input onChange={(e) => setPassword(e.target.value)} bg='white' type='password' />
                </FormControl>
                <VStack w='100%' alignItems={'start'}>
                    <Button onClick={handleLogin} w='40%' colorScheme="green" fontSize={'15px'}>Login</Button>
                    <Text onClick={handleNav} textColor={'blue'}>Create a new Account</Text>
                </VStack>
            </VStack>
        </Flex>
    )
}

export default Login