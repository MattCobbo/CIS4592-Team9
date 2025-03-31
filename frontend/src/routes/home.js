import { Heading, VStack, Text, Flex, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { get_posts, getOrganizationFeed } from "../api/endpoints";
import Post from "../components/post";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [orgPosts, setOrgPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState(1);

    const fetchData = async () => {
        try {
            const data = await get_posts(nextPage);
            setPosts(prevPosts => [...prevPosts, ...data.results]);  // ✅ Preserve previous posts
            setNextPage(prevPage => (data.next ? prevPage + 1 : null));
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const fetchOrgPosts = async () => {
        try {
            const orgData = await getOrganizationFeed();
            setOrgPosts(orgData);
        } catch (error) {
            console.error("Error getting organization posts:", error);
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchData(), fetchOrgPosts()]);  // ✅ Fetch data concurrently
            } catch (err) {
                console.error(err);
                alert("Error getting posts");
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, []);

    const loadMorePosts = () => {
        if (nextPage) {
            fetchData();
        }
    };

    return (
        <Flex w="100%" justifyContent="center" pt="50px">
            <VStack alignItems="start" gap="30px" w="30%" pb="50px">
                <Heading>Organization Feed</Heading>
                {loading ? (
                    <Text>Loading Organization Posts...</Text>
                ) : orgPosts.length > 0 ? (
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
                )}
            </VStack>

            <VStack alignItems="start" gap="30px" pb="50px">
                <Heading>Main Feed</Heading>
                {
                    loading ?
                        <Text>Loading Posts...</Text>
                        :
                        posts ?
                            posts.map((post) => {
                                return <Post key={post.id} id={post.id} username={post.username} description={post.description} formatted_date={post.formatted_date} liked={post.liked} like_count={post.like_count} />
                            })
                            : <></>
                }

                {nextPage && !loading && (
                    <Button onClick={loadMorePosts} w="100%">Load More</Button>
                )}
            </VStack>
        </Flex>
    );
};

export default Home;
