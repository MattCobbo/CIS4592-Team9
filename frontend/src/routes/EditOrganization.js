import { useState, useEffect } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  useToast,
  Box,
  Image,
  Spinner,
  Divider,
  Text
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrganization, updateOrganization } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";

const EditOrganization = () => {
  const { orgId } = useParams();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [discordServer, setDiscordServer] = useState("");
  const [discordChannel, setDiscordChannel] = useState("");

  const toast = useToast();
  const navigate = useNavigate();

  // Fetch the organization data on component mount
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const data = await getOrganization(orgId);

        // Check if the current user is the owner
        if (!data.is_owner) {
          setError("You don't have permission to edit this organization");
          return;
        }

        setName(data.name);
        setBio(data.bio);
        setCurrentImage(data.profile_image);
        setDiscordServer(data.discord_server || "");
        setDiscordChannel(data.discord_channel || "");
      } catch (err) {
        console.error("Error fetching organization:", err);
        setError("Could not load organization data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgId]);

  const handleUpdate = async () => {
    // Check if form is valid
    if (!name.trim()) {
      toast({
        title: "Name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSaving(true);

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("discord_server", discordServer);
      formData.append("discord_channel", discordChannel);

      // Only append the image if a new one was selected
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      await updateOrganization(orgId, formData);

      toast({
        title: "Organization updated",
        description: "Your changes have been saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Navigate back to organization profile
      navigate(`/organization/${orgId}`);
    } catch (err) {
      console.error("Error updating organization:", err);
      toast({
        title: "Update failed",
        description: "There was an error updating the organization",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/organization/${orgId}`);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="calc(100vh - 90px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" h="calc(100vh - 90px)">
        <Box p={5} borderWidth={1} borderRadius="md" textAlign="center">
          <Heading size="md" color="red.500">{error}</Heading>
          <Button mt={4} onClick={() => navigate(`/organization/${orgId}`)}>
            Back to Organization
          </Button>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex w="100%" h="calc(100vh - 90px)" justifyContent="center" alignItems="center" py={8} overflowY="auto">
      <VStack alignItems="start" w="95%" maxW="500px" gap="30px" p={6} borderWidth={1} borderRadius="lg" bg="white" boxShadow="md">
        <Heading>Edit Organization</Heading>

        <FormControl>
          <FormLabel>Organization Image</FormLabel>
          {currentImage && (
            <Box boxSize="100px" mb={3} borderRadius="md" overflow="hidden">
              <Image src={`${SERVER_URL}${currentImage}`} alt={name} boxSize="100%" objectFit="cover" />
            </Box>
          )}
          <Input
            onChange={(e) => setProfileImage(e.target.files[0])}
            bg="white"
            type="file"
            p={1}
            accept="image/*"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Organization Name</FormLabel>
          <Input
            onChange={(e) => setName(e.target.value)}
            value={name}
            bg="white"
            type="text"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            bg="white"
            h="150px"
            placeholder="Describe your organization"
          />
        </FormControl>

        <Divider my={2} />

        <Box w="100%">
          <Heading size="md" mb={4}>Discord Integration</Heading>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Connect your organization to Discord to show a widget on your organization page.
          </Text>

          <FormControl mb={4}>
            <FormLabel>Discord Server ID</FormLabel>
            <Input
              value={discordServer}
              onChange={(e) => setDiscordServer(e.target.value)}
              placeholder="e.g. 1234567890123456789"
              bg="white"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Discord Channel ID</FormLabel>
            <Input
              value={discordChannel}
              onChange={(e) => setDiscordChannel(e.target.value)}
              placeholder="e.g. 1234567890123456789"
              bg="white"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              To get these IDs, enable Developer Mode in Discord (Settings → Advanced),
              then right-click on your server/channel and select "Copy ID"
            </Text>
          </FormControl>
        </Box>

        <Flex w="100%" justifyContent="space-between" mt="20px">
          <Button
            onClick={handleCancel}
            colorScheme="gray"
            fontSize="15px"
            width="45%"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            colorScheme="blue"
            fontSize="15px"
            width="45%"
            isLoading={saving}
            loadingText="Saving"
          >
            Save Changes
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default EditOrganization;