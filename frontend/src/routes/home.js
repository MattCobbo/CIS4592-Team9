import { Heading, VStack, Text, Flex, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { get_posts, getOrganizationFeed } from "../api/endpoints";  // Import organization feed

import Post from "../components/post";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [orgPosts, setOrgPosts] = useState([]);  // Organization posts state
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState(1);

    const fetchData = async () => {
        try {
            const data = await get_posts(nextPage);
            setPosts([...posts, ...data.results]);
            setNextPage(data.next ? nextPage + 1 : null);
        } catch {
            alert("Error getting posts");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgPosts = async () => {
        try {
            const data = await getOrganizationFeed();
            setOrgPosts(data);
        } catch {
            alert("Error getting organization posts");
        }
    };

    useEffect(() => {
        fetchData();
        fetchOrgPosts();  // Fetch organization posts
    }, []);

    const loadMorePosts = () => {
        if (nextPage) {
            fetchData();
        }
    };

    return (
        <Flex w="100%" justifyContent="center" pt="50px">
            {/* Organization Posts (Left Side) */}
            <VStack alignItems="start" w="30%" p="10px">
                <Heading size="md">Organization Feed</Heading>
                {loading ? (
                    <Text>Loading Organization Posts...</Text>
                ) : (
                    orgPosts.length > 0 ? (
                        orgPosts.map((post) => (
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
                    ) : (
                        <Text>No organization posts yet.</Text>
                    )
                )}
            </VStack>

            {/* Main Feed (User Posts) */}
            <VStack alignItems="start" w="60%" gap="30px" pb="50px">
                <Heading>Main Feed</Heading>
                {loading ? (
                    <Text>Loading Posts...</Text>
                ) : (
                    posts.length > 0 ? (
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
                    ) : (
                        <Text>No posts yet.</Text>
                    )
                )}

                {nextPage && !loading && (
                    <Button onClick={loadMorePosts} w="100%">
                        Load More
                    </Button>
                )}
            </VStack>
        </Flex>
    );
};

export default Home;
