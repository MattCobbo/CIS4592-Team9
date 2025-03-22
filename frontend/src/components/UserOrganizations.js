import { VStack, Heading, Text, Box, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { getUserOrganizations } from "../api/endpoints";

const UserOrganizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [showOrganizations, setShowOrganizations] = useState(false);

    const fetchOrganizations = async () => {
        try {
            const data = await getUserOrganizations();
            setOrganizations(data);
        } catch (error) {
            console.error("Error fetching organizations:", error);
        }
    };

    useEffect(() => {
        if (showOrganizations) {
            fetchOrganizations();
        }
    }, [showOrganizations]);

    return (
        <VStack align="start" width="100%">
            <Button onClick={() => setShowOrganizations(!showOrganizations)} colorScheme="blue">
                {showOrganizations ? "Hide Organizations" : "View My Organizations"}
            </Button>

            {showOrganizations && (
                <VStack align="start" width="100%">
                    <Heading size="md">Organizations You Joined</Heading>
                    {organizations.length > 0 ? (
                        organizations.map((org) => (
                            <Box key={org.id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
                                <Text fontSize="lg" fontWeight="bold">{org.name}</Text>
                                <Text>{org.bio}</Text>
                            </Box>
                        ))
                    ) : (
                        <Text>No organizations found.</Text>
                    )}
                </VStack>
            )}
        </VStack>
    );
};

export default UserOrganizations;
