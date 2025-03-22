import { useEffect, useState } from "react"
import { getUserOrganizations } from "../api/endpoints"
import { VStack, Heading, Button, Box, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

const Organizations = () => {
    const [orgs, setOrgs] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                // Call the endpoint that returns only the user's organizations
                const data = await getUserOrganizations()
                setOrgs(data)
            } catch (err) {
                console.error("Error fetching user organizations:", err)
            }
        }
        fetchOrgs()
    }, [])

    return (
        <VStack spacing={4} p={4}>
            <Heading>My Organizations</Heading>

            {/* Button to create a new organization */}
            <Button onClick={() => navigate("/create-organization")}>
                Create Organization
            </Button>

            {/* List of user’s organizations */}
            {orgs.map((org) => (
                <Box
                    key={org.id}
                    p="4"
                    borderWidth="1px"
                    borderRadius="md"
                    marginTop="4"
                    width="400px"
                >
                    <Text fontWeight="bold" fontSize="lg">
                        {/* Clicking org name goes to org profile page */}
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/organization/${org.id}`)}
                        >
                            {org.name}
                        </span>
                    </Text>
                    <Text>{org.bio}</Text>
                </Box>
            ))}
        </VStack>
    )
}

export default Organizations
