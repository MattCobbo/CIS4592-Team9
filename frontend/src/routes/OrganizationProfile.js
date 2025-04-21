import { Flex, Text, VStack, Box, Heading, HStack, Image, Button, Spacer } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrganization, getOrganizationPosts, create_org_post } from "../api/endpoints";
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

                <HStack w="100%" spacing="40px" alignItems="flex-start" justifyContent="center" mt="40px">
                    <Box w="100%" maxW="640px">
                        <OrganizationPosts posts={posts} />
                    </Box>

                    {/* Discord Widget */}
                    <Box w="100%" maxW="640px">
                        <OrganizationDiscordWidget />
                    </Box>
                </HStack>
            </VStack>
        </Flex>
    );
};

const OrganizationDetails = ({ organization }) => {
    const navigate = useNavigate();

    const handleEditOrganization = () => {
        navigate(`/organization/${organization.id}/edit`);
    };

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
                    {organization.is_owner && <Button w="100%" onClick={handleEditOrganization}>Edit Organization</Button>}
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
            const newPost = await create_org_post({
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

const OrganizationDiscordWidget = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const widget = document.createElement("widgetbot");
        widget.setAttribute("server", "1328070588882882580");
        widget.setAttribute("channel", "1328070588882882587");
        widget.setAttribute("width", "100%");
        widget.setAttribute("height", "100%");

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/html-embed";
        script.async = true;

        containerRef.current.appendChild(widget);
        containerRef.current.appendChild(script);
    }, []);

    return (
        <Box
            ref={containerRef}
            w="100%"
            maxW="640px"
            h="600px"
            borderRadius="lg"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="md"
            bg="white"
        />
    );
};

export default OrganizationProfile;
