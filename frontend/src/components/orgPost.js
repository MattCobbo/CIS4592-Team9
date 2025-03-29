import { useEffect, useState } from "react";
import { create_post, getOrganizationPosts } from "../api/endpoints";
import { VStack, Text, Spinner, Button, Textarea } from "@chakra-ui/react";
import Post from "../components/post";

/**
 * Combined component that:
 * 1) Fetches and displays organization's posts
 * 2) Provides a button/form to create a new organization post (if allowed)
 *
 * @param {string|number} orgId - The ID of the organization
 * @param {boolean} canPost - Whether the logged-in user can create org posts
 */
const OrgPost = ({ orgId, canPost = false }) => {
    // Post feed state
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create post state
    const [showInput, setShowInput] = useState(false);
    const [description, setDescription] = useState("");

    // Fetch organization posts on mount
    useEffect(() => {
        const fetchOrgPosts = async () => {
            try {
                const data = await getOrganizationPosts(orgId);
                // If user isn't a member, data might be { error: "..."}
                if (Array.isArray(data)) {
                    setPosts(data);
                } else if (data.error) {
                    setError(data.error);
                }
            } catch (err) {
                setError("Error loading org posts");
            } finally {
                setLoading(false);
            }
        };
        fetchOrgPosts();
    }, [orgId]);

    // Handle creating a new post
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ Ensure organization ID is sent correctly
            const newPost = await create_post({
                description,
                organization_id: orgId,  // ✅ Now correctly sends org ID
            });

            if (newPost.error) {
                alert("Error creating post");
                return;
            }

            // ✅ Immediately update the UI
            setPosts([newPost, ...posts]);

            setDescription("");
            setShowInput(false);

            // ✅ Re-fetch organization posts after submission
            setLoading(true);
            const updatedPosts = await getOrganizationPosts(orgId);
            setPosts(updatedPosts);
            setLoading(false);
        } catch {
            alert("Error creating post");
        }
    };

    // Loading spinner
    if (loading) return <Spinner />;

    // Error message
    if (error) return <Text color="red.500">{error}</Text>;

    return (
        <VStack align="start" w="100%">
            {/* CREATE POST SECTION (if user can post) */}
            {canPost && (
                <VStack align="start" w="100%">
                    <Button onClick={() => setShowInput(!showInput)}>
                        {showInput ? "Close" : "+ Create Post"}
                    </Button>
                    {showInput && (
                        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                            <Textarea
                                placeholder="Enter your post content"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                mb={2}
                            />
                            <Button type="submit" colorScheme="blue">
                                Submit
                            </Button>
                        </form>
                    )}
                </VStack>
            )}

            {/* ORG POSTS FEED */}
            {posts.length === 0 ? (
                <Text>No posts yet.</Text>
            ) : (
                posts.map((post) => (
                    <Post
                        key={post.id}
                        id={post.id}
                        username={post.username}
                        description={post.description}
                        formatted_date={post.formatted_date}
                        liked={post.liked}
                        like_count={post.like_count}
                    />
                ))
            )}
        </VStack>
    );
};

export default OrgPost;
