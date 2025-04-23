import { Button, Flex, VStack, FormControl, FormLabel, Input, Heading, Text, FormErrorMessage, List, ListItem, Box } from "@chakra-ui/react"
import { register, check_username_availability } from "../api/endpoints"
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
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
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
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordErrors(validatePassword(newPassword));
    }

    // Add this function to check username availability
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

    const handleRegister = async () => {
        // Reset errors
        setErrors({});

        // Basic validation
        const newErrors = {};
        if (!username || !username.trim()) newErrors.username = "Username is required";
        if (!email || !email.trim()) newErrors.email = "Email is required";
        if (!password || !password.trim()) newErrors.password = "Password is required";

        // Check if passwords match
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {

            await register(username, email, firstName, lastName, password);
            // Handle successful registration
            navigate("/login");
        } catch (error) {
            // Handle errors from the API
            if (error.response?.data?.error) {
                if (error.response.data.error.includes("Username already exists")) {
                    setErrors({ username: error.response.data.error });
                } else {
                    setErrors({ general: error.response.data.error });
                }
            } else {
                setErrors({ general: "Registration failed. Please try again." });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNav = () => {
        navigate('/login')
    }

    return (
        <Box
            w='100%'
            bg="white"
            pt="40px" // Add padding top to push content down below the navigation bar
        >
            <Flex
                direction="column"
                alignItems="center"
                w='100%'
            >
                <VStack
                    alignItems='start'
                    w='95%'
                    maxW='500px'
                    spacing="20px"
                >
                    <Heading size="xl" mb={4}>Register</Heading>

                    <FormControl isInvalid={errors.username}>
                        <FormLabel htmlFor='username'>Username</FormLabel>
                        <Input
                            id='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={() => checkUsernameAvailability(username)}
                            bg='white'
                            type='text'
                            h="40px" // Fixed height
                        />
                        <Box minH="20px">
                            {errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
                        </Box>
                    </FormControl>

                    <FormControl isInvalid={errors.email}>
                        <FormLabel htmlFor='email'>Email</FormLabel>
                        <Input
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            bg='white'
                            type='email'
                            h="40px"
                        />
                        <Box minH="20px">
                            {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                        </Box>
                    </FormControl>

                    <FormControl>
                        <FormLabel htmlFor='firstName'>First Name</FormLabel>
                        <Input onChange={(e) => setFirstName(e.target.value)} bg='white' type='text' paddingLeft="10px" />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor='lastName'>Last Name</FormLabel>
                        <Input onChange={(e) => setLastName(e.target.value)} bg='white' type='text' paddingLeft="10px" />
                    </FormControl>
                    <FormControl isInvalid={passwordErrors.length > 0}>
                        <FormLabel htmlFor='password'>Password</FormLabel>
                        <Input onChange={handlePasswordChange} bg='white' type='password' paddingLeft="10px" />
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
                    <FormControl isInvalid={errors.confirmPassword}>
                        <FormLabel htmlFor='confirmPassword'>Confirm Password</FormLabel>
                        <Input
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            bg='white'
                            type='password'
                            paddingLeft="10px"
                        />
                        {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
                    </FormControl>
                    {errors.general && <Text color="red.500">{errors.general}</Text>}
                    <VStack w='100%' alignItems={'start'}>
                        <Button
                            onClick={handleRegister}
                            isLoading={isSubmitting}
                            colorScheme="blue"
                            w="100%"
                            mt={4}
                        >
                            Register
                        </Button>
                        <Text onClick={handleNav} textColor={'blue'}>Already have an Account?</Text>
                    </VStack>
                </VStack>
            </Flex>
        </Box>
    )
}

export default Register