import { Flex, Text, VStack, Box, Heading, HStack, Image, Button, Spacer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get_user_profile_data, toggleFollow, get_users_posts, create_post } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";
import UserOrganizations from "../components/UserOrganizations";
import Post from "../components/post";

const UserProfile = () => {
    const get_username_from_url = () => {
        const url_split = window.location.pathname.split('/');
        return url_split[url_split.length - 1];
    };

    const [username, setUsername] = useState(get_username_from_url());
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUsername(get_username_from_url());
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const userPosts = await get_users_posts(username);
                setPosts(userPosts);
            } catch {
                alert("Error getting posts");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [username]);

    return (
        <Flex w="100%" justifyContent="center">
            <VStack w="75%">
                <Box w="100%" mt="40px">
                    <UserDetails username={username} />
                </Box>
                <Box w="100%" mt="40px">
                    <CreatePost username={username} setPosts={setPosts} posts={posts} />
                </Box>
                <Box w="100%" mt="40px">
                    <UserOrganizations />
                </Box>
                <Box w="100%" mt="40px">
                    <UserPosts posts={posts} loading={loading} />
                </Box>
            </VStack>
        </Flex>
    );
};

const UserDetails = ({ username }) => {
    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [followerCount, setFollowerCount] = useState('');
    const [followingCount, setFollowingCount] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [following, setFollowing] = useState(false);

    const nav = useNavigate();

    const handleNavigate = (route) => {
        nav(`/${route}`);
    }

    const handleToggleFollow = async () => {
        const data = await toggleFollow(username);
        setFollowerCount(data.following ? followerCount + 1 : followerCount - 1);
        setFollowing(data.following);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await get_user_profile_data(username);
                setBio(data.bio);
                setProfileImage(data.profile_image);
                setFollowerCount(data.follower_count);
                setFollowingCount(data.following_count);
                setIsOwner(data.is_owner);
                setFollowing(data.following);
            } catch {
                console.log("Error loading user profile");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <VStack alignItems="start" w="100%" gap="40px">
            <Heading>@{username}</Heading>
            <HStack gap="20px">
                <Box boxSize="150px" border="2px solid" borderColor="gray.700" bg="white" borderRadius="full" overflow="hidden">
                    <Image src={loading ? '' : `${SERVER_URL}${profileImage}`} boxSize="100%" objectFit="cover" />
                </Box>
                <VStack gap="20px">
                    <HStack gap="20px" fontSize="18px">
                        <VStack>
                            <Text>Followers</Text>
                            <Text>{loading ? '-' : followerCount}</Text>
                        </VStack>
                        <VStack>
                            <Text>Following</Text>
                            <Text>{loading ? '-' : followingCount}</Text>
                        </VStack>
                    </HStack>
                    {
                        loading ? <Spacer /> :
                            isOwner ? <Button onClick={(route) => handleNavigate('settings')} w='100%'>Edit Profile</Button> : <Button onClick={handleToggleFollow} w='100%' colorScheme="blue">{following ? 'Unfollow' : 'Follow'}</Button>
                    }
                </VStack>
            </HStack>
            <Text fontSize="18px">{loading ? '-' : bio}</Text>
        </VStack>
    );
};

const CreatePost = ({ username, setPosts, posts }) => {
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [showInput, setShowInput] = useState(false);

    const handleInputChange = (event) => {
        setNewPostContent(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newPost = await create_post({
                description: newPostContent,
                organization_id: null, // Ensures it's a personal post
            });

            if (newPost.error) {
                alert("Error creating post");
                return;
            }

            // ✅ Update UI immediately
            setPosts([newPost, ...posts]);

            setNewPostContent('');
            setShowInput(false);
        } catch {
            alert("Error creating post");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await get_user_profile_data(username);
                setIsOwner(data.is_owner);
            } catch {
                console.log("Error loading user data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            {
                loading ? <Spacer /> :
                    isOwner ? <div>
                        <Button backgroundColor={'blue.100'} color={'blue'} onClick={() => setShowInput(!showInput)}>
                            {showInput ? 'Close Input' : '+ Create Post'}
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
                    </div> : <Spacer />
            }
        </div>
    );
}


const UserPosts = ({ username }) => {

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const posts = await get_users_posts(username)
                setPosts(Array.isArray(posts) ? posts : []);
            } catch {
                alert('error getting posts')
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [username])

    return (
        <Flex direction={'column'} gap={'30px'} pb={'60px'}>
            {
                loading ? <Text>Loading...</Text>
                    : posts.map((post) => {
                        return <Post key={post.id} id={post.id} username={post.username} description={post.description} formatted_date={post.formatted_date} liked={post.liked} like_count={post.like_count} />
                    })
            }
        </Flex>
    );
};

export default UserProfile;
