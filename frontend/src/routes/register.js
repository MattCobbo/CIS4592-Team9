import { Button, Flex, VStack, FormControl, FormLabel, Input, Heading, Text } from "@chakra-ui/react"
import { login, register } from "../api/endpoints"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Register = () => {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (password === confirmPassword) {
            try {
                await register(username, email, firstName, lastName, password);
                alert('Created new account')
                navigate('/login')
            } catch {
                alert('error registering new account')
            }
        } else {
            alert('passwords do not match')
        }
    }

    const handleNav = () => {
        navigate('/login')
    }

    return (
        <Flex w='100%' h='calc(100vh - 90px)' justifyContent={'center'} alignItems={'center'}>
            <VStack alignItems='start' w='95%' maxW='400px' gap='30px'>
                <Heading>Register</Heading>
                <FormControl>
                    <FormLabel htmlFor='username'>Username</FormLabel>
                    <Input onChange={(e) => setUsername(e.target.value)} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor='email'>Email</FormLabel>
                    <Input onChange={(e) => setEmail(e.target.value)} bg='white' type='email' />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor='firstName'>First Name</FormLabel>
                    <Input onChange={(e) => setFirstName(e.target.value)} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor='lastName'>Last Name</FormLabel>
                    <Input onChange={(e) => setLastName(e.target.value)} bg='white' type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor='password'>Password</FormLabel>
                    <Input onChange={(e) => setPassword(e.target.value)} bg='white' type='password' />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor='confirmPassword'>Confirm Password</FormLabel>
                    <Input onChange={(e) => setConfirmPassword(e.target.value)} bg='white' type='password' />
                </FormControl>
                <VStack w='100%' alignItems={'start'}>
                    <Button onClick={handleRegister} w='40%' colorScheme="green" fontSize={'15px'}>Register</Button>
                    <Text onClick={handleNav} textColor={'blue'}>Already have an Account?</Text>
                </VStack>
            </VStack>
        </Flex>
    )
}

export default Register