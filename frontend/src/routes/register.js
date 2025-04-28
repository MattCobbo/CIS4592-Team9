import { Button, Flex, VStack, FormControl, FormLabel, Input, Heading, Text, Box } from "@chakra-ui/react"
import { login, register, check_username_availability } from "../api/endpoints"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const PasswordRequirements = ({ password }) => {
    const requirements = [
        { text: "At least 8 characters", met: password.length >= 8 },
        { text: "At least one uppercase letter", met: /[A-Z]/.test(password) },
        { text: "At least one lowercase letter", met: /[a-z]/.test(password) },
        { text: "At least one number", met: /[0-9]/.test(password) },
        { text: "At least one special character", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) }
    ];

    return (
        <Box mt={2}>
            <Text fontSize="sm" fontWeight="medium">Password must contain:</Text>
            {requirements.map((req, index) => (
                <Text
                    key={index}
                    fontSize="xs"
                    color={req.met ? "green.500" : "gray.500"}
                >
                    {req.met ? "✓" : "○"} {req.text}
                </Text>
            ))}
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
    const [errors, setErrors] = useState({})
    const navigate = useNavigate();

    const handleRegister = async () => {
        // Check password complexity before submission
        const passwordErrors = validatePassword(password);

        if (passwordErrors.length > 0) {
            // Set errors to display to user
            setErrors(prev => ({ ...prev, password: passwordErrors }));
            return; // Stop the registration process
        }

        if (password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
            return; // Stop the registration process
        }

        try {
            await register(username, email, firstName, lastName, password);
            alert('Created new account')
            navigate('/login')
        } catch (error) {
            if (error.response && error.response.data) {
                // Handle server validation errors
                setErrors(prev => ({ ...prev, ...error.response.data }));
            } else {
                alert('Error registering new account')
            }
        }
    }

    const handleNav = () => {
        navigate('/login')
    }

    const checkUsernameAvailability = async (username) => {
        if (!username) return;

        try {
            const response = await check_username_availability(username);

            if (!response.available) {
                setErrors(prev => ({ ...prev, username: "Username already exists. Please choose a different one." }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.username;
                    return newErrors;
                });
            }
        } catch (error) {
            console.error("Error checking username:", error);
        }
    };

    const handleUsernameBlur = () => {
        if (username) {
            checkUsernameAvailability(username);
        }
    };

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
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            errors.push("Password must contain at least one special character");
        }

        return errors;
    }

    // Password strength indicator 
    const PasswordStrengthMeter = ({ password }) => {
        const getStrengthLevel = (password) => {
            const errors = validatePassword(password);
            if (errors.length === 0) return 100;
            if (errors.length <= 2) return 70;
            if (errors.length <= 4) return 40;
            return 10;
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

    return (
        <Flex
            w='100%'
            h='calc(100vh - 90px)'
            justifyContent='center'
            overflow="auto" // Make the container scrollable
            py={4} // Add padding at top and bottom
        >
            <VStack
                alignItems='start'
                w='95%'
                maxW='400px'
                gap='20px' // Reduced gap slightly
                my={4} // Add margin at top and bottom
            >
                <Heading>Register</Heading>
                <FormControl isInvalid={!!errors.username}>
                    <FormLabel htmlFor='username'>Username</FormLabel>
                    <Input
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onBlur={handleUsernameBlur}
                        placeholder="Username"
                        bg='white'
                        type='text'
                    />
                    {errors.username && (
                        <Text id="username-error" color="red.500" fontSize="sm">{errors.username}</Text>
                    )}
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
                <FormControl isInvalid={errors.password && errors.password.length > 0}>
                    <FormLabel htmlFor='password'>Password</FormLabel>
                    <Input
                        onChange={(e) => setPassword(e.target.value)}
                        bg='white'
                        type='password'
                    />
                    {errors.password && errors.password.length > 0 && (
                        <Box color="red.500" fontSize="sm" mt={1}>
                            {typeof errors.password === 'string'
                                ? errors.password
                                : errors.password.map((err, idx) => (
                                    <Text key={idx}>{err}</Text>
                                ))
                            }
                        </Box>
                    )}
                    <PasswordRequirements password={password} />
                    <PasswordStrengthMeter password={password} />
                </FormControl>
                <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel htmlFor='confirmPassword'>Confirm Password</FormLabel>
                    <Input onChange={(e) => setConfirmPassword(e.target.value)} bg='white' type='password' />
                    {errors.confirmPassword && (
                        <Text color="red.500" fontSize="sm">{errors.confirmPassword}</Text>
                    )}
                </FormControl>
                <VStack w='100%' alignItems='start'>
                    <Button onClick={handleRegister} w='40%' colorScheme="green" fontSize={'15px'}>Register</Button>
                    <Text
                        onClick={handleNav}
                        textColor='blue'
                        cursor="pointer" // Add pointer cursor for better UX
                    >
                        Already have an Account?
                    </Text>
                </VStack>
            </VStack>
        </Flex>
    )
}

export default Register