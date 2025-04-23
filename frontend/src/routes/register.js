import { Button, Flex, VStack, FormControl, FormLabel, Input, Heading, Text, FormErrorMessage, List, ListItem, Box } from "@chakra-ui/react"
import { login, register } from "../api/endpoints"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Password complexity
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    return errors;
}

// Password strength indicator 
const PasswordStrengthMeter = ({ password }) => {
    const getStrengthLevel = (password) => {
        const errors = validatePassword(password);
        if (errors.length === 0) return 100; // Strong
        if (errors.length <= 2) return 70;   // Medium
        if (errors.length <= 4) return 40;   // Weak
        return 10; // Very weak
    };

    const strength = getStrengthLevel(password);
    let color = "red.500";
    if (strength >= 100) color = "green.500";
    else if (strength >= 70) color = "yellow.500";
    else if (strength >= 40) color = "orange.500";

    return (
        <Box mt={2}>
            <Text fontSize="sm" mb={1}>Password Strength</Text>
            <Box w="100%" bg="gray.200" h="8px" borderRadius="full">
                <Box w={`${strength}%`} bg={color} h="100%" borderRadius="full" />
            </Box>
        </Box>
    );
};

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordErrors, setPasswordErrors] = useState([])
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordErrors(validatePassword(newPassword));
    }

    const handleRegister = async () => {
        // First check password complexity
        const errors = validatePassword(password);
        if (errors.length > 0) {
            setPasswordErrors(errors);
            return;
        }

        // Then check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await register(username, email, firstName, lastName, password);
            alert('Created new account');
            navigate('/login');
        } catch {
            alert('Error registering new account');
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
                <FormControl isInvalid={passwordErrors.length > 0}>
                    <FormLabel htmlFor='password'>Password</FormLabel>
                    <Input onChange={handlePasswordChange} bg='white' type='password' />
                    <PasswordStrengthMeter password={password} />
                    {passwordErrors.length > 0 && (
                        <FormErrorMessage>
                            <List spacing={1} styleType="disc" pl={4}>
                                {passwordErrors.map((error, index) => (
                                    <ListItem key={index}>{error}</ListItem>
                                ))}
                            </List>
                        </FormErrorMessage>
                    )}
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