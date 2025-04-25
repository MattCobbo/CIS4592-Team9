import { useState } from "react"
import { createOrganization } from "../api/endpoints"
import { VStack, Heading, Button, Input, FormControl, FormLabel, Textarea, useToast, FormErrorMessage } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

const CreateOrganization = () => {
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [nameError, setNameError] = useState("")
    const navigate = useNavigate()
    const toast = useToast()

    const handleSubmit = async () => {
        // Reset error state
        setNameError("")

        // Validate input
        if (!name.trim()) {
            setNameError("Organization name is required")
            return
        }

        setIsLoading(true)
        try {
            const response = await createOrganization(name, bio)

            toast({
                title: "Success!",
                description: "Organization created successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            })

            // Navigate to the new organization page
            navigate(`/organization/${response.id}`)
        } catch (err) {
            // Show specific error from API if available
            const errorMessage = err.message || "Error creating organization"

            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
            })

            // If name already exists error, set the field error
            if (errorMessage.includes("name already exists")) {
                setNameError("An organization with this name already exists")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <VStack spacing={6} w="100%" maxW="500px" mx="auto" p={5}>
            <Heading>Create Organization</Heading>

            <FormControl isRequired isInvalid={!!nameError}>
                <FormLabel>Organization Name</FormLabel>
                <Input
                    placeholder="Enter organization name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {nameError && <FormErrorMessage>{nameError}</FormErrorMessage>}
            </FormControl>

            <FormControl>
                <FormLabel>Organization Bio</FormLabel>
                <Textarea
                    placeholder="Describe your organization"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    h="150px"
                />
            </FormControl>

            <Button
                onClick={handleSubmit}
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
                loadingText="Creating"
            >
                Create Organization
            </Button>

            <Button
                onClick={() => navigate("/organizations")}
                variant="outline"
            >
                Cancel
            </Button>
        </VStack>
    )
}

export default CreateOrganization
