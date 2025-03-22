import { Flex, Text, VStack, Box, Heading, HStack, Image, Button, Spacer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrganization, getOrganizationPosts, create_post } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";
import Post from "../components/post";

const OrganizationProfile = () => {
    const { orgId } = useParams();
    const [organization, setOrganization] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            try {
                const data = await getOrganization(orgId);
                setOrganization(data);
            } catch {
                setError("Could not load organization.");
            } finally {
                setLoading(false);
            }
        };

        const fetchPosts = async () => {
            try {
                const orgPosts = await getOrganizationPosts(orgId);
                setPosts(orgPosts);
            } catch {
                setError("Error getting posts.");
            }
        };

        fetchOrganizationData();
        fetchPosts();
    }, [orgId]);

    if (loading) return <Text>Loading...</Text>;
    if (error || !organization) return <Text color="red.500">{error || "Organization not found."}</Text>;

    return (
        <Flex w="100%" justifyContent="center">
            <VStack w="75%">
                <Box w="100%" mt="40px">
                    <OrganizationDetails organization={organization} />
                </Box>
                <Box w="100%" mt="40px">
                    <CreateOrgPost orgId={orgId} setPosts={setPosts} posts={posts} />
                </Box>
                <Box w="100%" mt="40px">
                    <OrganizationPosts posts={posts} />
                </Box>
            </VStack>
        </Flex>
    );
};

const OrganizationDetails = ({ organization }) => {
    return (
        <VStack alignItems="start" w="100%" gap="40px">
            <Heading>{organization.name}</Heading>
            <HStack gap="20px">
                <Box boxSize="150px" border="2px solid" borderColor="gray.700" bg="white" borderRadius="full" overflow="hidden">
                    <Image src={`${SERVER_URL}${organization.profile_image}`} boxSize="100%" objectFit="cover" />
                </Box>
                <VStack gap="20px">
                    <VStack fontSize="18px">
                        <Text>Members</Text>
                        <Text>{organization.member_count}</Text>
                    </VStack>
                    {organization.is_owner && <Button w="100%">Edit Organization</Button>}
                </VStack>
            </HStack>
            <Text fontSize="18px">{organization.bio}</Text>
        </VStack>
    );
};

const CreateOrgPost = ({ orgId, setPosts, posts }) => {
    const [showInput, setShowInput] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");

    const handleInputChange = (event) => {
        setNewPostContent(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newPost = await create_post({
                description: newPostContent,
                organization_id: orgId,
            });

            if (newPost.error) {
                alert("Error creating post");
                return;
            }

            setPosts([newPost, ...posts]);
            setNewPostContent("");
            setShowInput(false);
        } catch {
            alert("Error creating post");
        }
    };

    return (
        <div>
            <Button backgroundColor="blue.100" color="blue" onClick={() => setShowInput(!showInput)}>
                {showInput ? "Close Input" : "+ Create Post"}
            </Button>
            {showInput && (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={newPostContent}
                        onChange={handleInputChange}
                        placeholder="Enter your post"
                    />
                    <Button type="submit">Submit</Button>
                </form>
            )}
        </div>
    );
};

const OrganizationPosts = ({ posts }) => {
    return (
        <Flex direction="column" gap="30px" pb="60px">
            {posts.length > 0 ? (
                posts.map((post) => (
                    <Post key={post.id} id={post.id} username={post.username} description={post.description} formatted_date={post.formatted_date} liked={post.liked} like_count={post.like_count} />
                ))
            ) : (
                <Text>No posts yet.</Text>
            )}
        </Flex>
    );
};

export default OrganizationProfile;
