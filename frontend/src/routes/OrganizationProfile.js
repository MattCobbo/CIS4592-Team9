import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, useToast } from "@chakra-ui/react";
import { createEvent, updateRSVP } from "../api/endpoints";
import { Flex, Text, VStack, Box, Heading, HStack, Image, Button, Spacer, Divider } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrganization, getOrganizationPosts, getOrganizationEvents, create_org_post } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";
import Post from "../components/post";

const OrganizationProfile = () => {
    const { orgId } = useParams();
    const [organization, setOrganization] = useState(null);
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
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

        const fetchEvents = async () => {
            try {
                const orgEvents = await getOrganizationEvents(orgId);
                setEvents(orgEvents);
            } catch {
                setError("Error getting events.");
            }
        };

        fetchOrganizationData();
        fetchPosts();
        fetchEvents();
    }, [orgId]);

    if (loading) return <Text>Loading...</Text>;
    if (error || !organization) return <Text color="red.500">{error || "Organization not found."}</Text>;

    return (
        <Flex w="100%" justifyContent="center">
            {/* 🔄 TWO‑COLUMN LAYOUT: posts (left) | events (right) */}
            <HStack w="90%" alignItems="flex-start" spacing="60px">
                <VStack w="55%">
                    <Box w="100%" mt="40px">
                        <OrganizationDetails organization={organization} />
                    </Box>

                    <Box w="100%" mt="40px">
                        <CreateOrgPost
                            orgId={orgId}
                            setPosts={setPosts}
                            posts={posts}
                        />
                    </Box>

                    {organization.is_owner && (<Box w="100%">
                        <CreateEvent orgId={orgId} />
                    </Box>
                    )}


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

                <VStack w="45%" alignItems="flex-start" spacing="30px" mt="40px">
                    <Heading size="lg">Upcoming Events</Heading>
                    <Divider />
                    <OrganizationEvents events={events} />
                </VStack>
            </HStack>
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

const OrganizationEvents = ({ events }) => {
    const toast = useToast();
    const currentUser =
        JSON.parse(localStorage.getItem("userData") || "{}").username || "";

    const [selected, setSelected] = useState({});

    useEffect(() => {
        const map = {};
        events.forEach((ev) => {
            const me = ev.attendance?.find(
                (a) => a.username === currentUser
            );
            if (me) map[ev.id] = me.rsvp;
        });
        setSelected(map);
    }, [events, currentUser]);

    const handleRSVP = async (eventId, rsvp) => {
        try {
            await updateRSVP(eventId, rsvp);
            /* local‑UI update */
            setSelected((prev) => ({ ...prev, [eventId]: rsvp }));
            toast({ title: "RSVP updated", status: "success", duration: 1500 });
        } catch {
            toast({ title: "Could not update RSVP", status: "error" });
        }
    };

    return (
        <Flex direction="column" gap="20px" pb="60px" w="100%">
            {events.length > 0 ? (
                events.map((ev) => (
                    <Box
                        key={ev.id}
                        p="4"
                        borderWidth="1px"
                        borderRadius="md"
                        bg="purple.50"
                        w="100%"
                    >
                        <Heading size="md" mb="2">
                            {ev.title}
                        </Heading>

                        <Text fontSize="sm" color="gray.600">
                            {new Date(ev.starts_at).toLocaleDateString()}
                        </Text>

                        <Text my="2">{ev.description}</Text>

                        <HStack mt="2">
                            <Button
                                size="sm"
                                colorScheme="green"
                                variant={selected[ev.id] === "Y" ? "solid" : "outline"}
                                onClick={() => handleRSVP(ev.id, "Y")}
                            >
                                Going
                            </Button>
                            <Button
                                size="sm"
                                colorScheme="red"
                                variant={selected[ev.id] === "N" ? "solid" : "outline"}
                                onClick={() => handleRSVP(ev.id, "N")}
                            >
                                Not Going
                            </Button>
                            <Button
                                size="sm"
                                colorScheme="gray"
                                variant={selected[ev.id] === "M" ? "solid" : "outline"}
                                onClick={() => handleRSVP(ev.id, "M")}
                            >
                                Maybe
                            </Button>
                        </HStack>
                        <Text mt="2" fontSize="xs" color="gray.500">
                            Created by {ev.creator_username}
                        </Text>
                    </Box>
                ))
            ) : (
                <Text>No events scheduled.</Text>
            )}
        </Flex>
    );
};


const CreateEvent = ({ orgId, setOrgPosts }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startsAt, setStartsAt] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dateParts = startsAt.split("/");
        if (dateParts.length !== 3) {
            toast({ title: "Invalid date", status: "error" });
            return;
        }

        const [month, day, year] = dateParts;
        const isoDate = new Date(`${year}-${month}-${day}T00:00:00`).toISOString();

        try {
            await createEvent({ organization_id: orgId, title, description, starts_at: isoDate });
            toast({ title: "Event created!", status: "success" });
            onClose();
        } catch (err) {
            toast({ title: "Error creating event", status: "error" });
        }
    };

    return (
        <>
            <Button onClick={onOpen} colorScheme="purple">+ Create Event</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Event</ModalHeader>
                    <ModalCloseButton />
                    <form onSubmit={handleSubmit}>
                        <ModalBody>
                            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} mb={3} />
                            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} mb={3} />
                            <Input placeholder="MM/DD/YYYY" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" colorScheme="blue" mr={3}>Submit</Button>
                            <Button onClick={onClose}>Cancel</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
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
