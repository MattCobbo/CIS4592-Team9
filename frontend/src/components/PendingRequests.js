import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  useToast,
  Divider,
  Avatar,
} from "@chakra-ui/react";
import { getOrganization } from "../api/endpoints";

const PendingRequests = ({ orgId, onUpdateMembers }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Function to accept a join request
  const handleAcceptRequest = async (username) => {
    try {
      // In your system, username IS the primary key for users
      const response = await fetch(`http://127.0.0.1:8000/api/organization/accept/${orgId}/${username}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Request accepted",
          description: "User has been added to the organization",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Remove the accepted user from pending list
        setPendingUsers(pendingUsers.filter(user => user.username !== username));
        // Refresh organization data if callback provided
        if (onUpdateMembers) onUpdateMembers();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to accept request",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to process request",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to decline a join request
  const handleDeclineRequest = async (username) => {
    // This would need a new API endpoint
    toast({
      title: "Not implemented",
      description: "Decline functionality needs a new API endpoint",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    // For now, we'll just remove from the UI
    setPendingUsers(pendingUsers.filter(user => user.username !== username));
  };

  // Fetch pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        const data = await getOrganization(orgId);
        
        if (data.pending_requests) {
          // Transform usernames to objects for easier handling
          const pendingUserObjects = data.pending_requests.map(username => ({
            username,
          }));
          setPendingUsers(pendingUserObjects);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        toast({
          title: "Error",
          description: "Could not load pending requests",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [orgId]);

  if (loading) {
    return <Text>Loading pending requests...</Text>;
  }

  return (
    <Box width="100%" p={4} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>
        Pending Join Requests
      </Heading>
      
      <Divider mb={4} />
      
      {pendingUsers.length === 0 ? (
        <Text>No pending requests</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {pendingUsers.map((user) => (
            <Box key={user.username} p={3} borderWidth="1px" borderRadius="md">
              <HStack justify="space-between">
                <HStack>
                  <Avatar size="sm" name={user.username} />
                  <Text fontWeight="bold">{user.username}</Text>
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleAcceptRequest(user.username)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeclineRequest(user.username)}
                  >
                    Decline
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default PendingRequests;