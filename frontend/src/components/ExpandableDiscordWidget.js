import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    Text,
    Icon,
    useOutsideClick,
    Flex,
} from "@chakra-ui/react";
import { FaDiscord } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const ExpandableDiscordWidget = ({ serverId, channelId, errorMessage }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const widgetRef = useRef(null);
    const buttonRef = useRef(null);

    // Handle click outside to collapse widget
    useOutsideClick({
        ref: widgetRef,
        handler: () => {
            if (isExpanded && !isDragging) {
                setIsExpanded(false);
            }
        },
    });

    // Setup the Discord widget when expanded
    useEffect(() => {
        if (isExpanded && widgetRef.current && serverId && channelId) {
            widgetRef.current.innerHTML = "";

            try {
                const widget = document.createElement("widgetbot");
                widget.setAttribute("server", serverId);
                widget.setAttribute("channel", channelId);
                widget.setAttribute("width", "100%");
                widget.setAttribute("height", "100%");

                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/html-embed";
                script.async = true;

                widgetRef.current.appendChild(widget);
                widgetRef.current.appendChild(script);
            } catch (err) {
                console.error("Error loading Discord widget:", err);
            }
        }
    }, [isExpanded, serverId, channelId]);

    // Handle mouse for dragging
    const handleMouseDown = (e) => {
        if (buttonRef.current) {
            setIsDragging(true);
            const rect = buttonRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Ensure button stays within viewport boundaries
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 60),
                y: Math.min(prev.y, window.innerHeight - 60)
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // If no server/channel ID is provided
    if (!serverId || !channelId) {
        return null;
    }

    // Calculate widget position to stay within screen bounds
    const getWidgetPosition = () => {
        const WIDGET_WIDTH = 450;
        const WIDGET_HEIGHT = 600;
        const BUTTON_SIZE = 60;
        const SCREEN_PADDING = 20;

        // Default position (below button)
        let posX = position.x;
        let posY = position.y + BUTTON_SIZE + 10;

        // Check right edge
        if (posX + WIDGET_WIDTH > window.innerWidth - SCREEN_PADDING) {

            posX = Math.max(SCREEN_PADDING, position.x + BUTTON_SIZE - WIDGET_WIDTH);
        }

        // Check bottom edge
        if (posY + WIDGET_HEIGHT > window.innerHeight - SCREEN_PADDING) {

            posY = Math.max(SCREEN_PADDING, position.y - WIDGET_HEIGHT - 10);
        }

        return { x: posX, y: posY };
    };

    return (
        <>
            {/* Floating Discord Button */}
            <Button
                ref={buttonRef}
                position="fixed"
                left={`${position.x}px`}
                top={`${position.y}px`}
                zIndex={1000}
                borderRadius="full"
                colorScheme="purple"
                size="lg"
                w="60px"
                h="60px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                onMouseDown={handleMouseDown}
                onClick={() => !isDragging && setIsExpanded(!isExpanded)}
                cursor={isDragging ? "grabbing" : "grab"}
                opacity={0.9}
                _hover={{ opacity: 1 }}
            >
                <Icon as={FaDiscord} w={6} h={6} />
            </Button>

            {isExpanded && (
                <Box
                    ref={widgetRef}
                    position="fixed"
                    left={`${getWidgetPosition().x}px`}
                    top={`${getWidgetPosition().y}px`}
                    width="450px"
                    height="600px"
                    zIndex={900}
                    boxShadow="xl"
                    borderRadius="md"
                    overflow="hidden"
                    bg="white"
                    transform="origin-top-left"
                    transition="all 0.3s ease-in-out"
                    animation="0.3s ease-out 0s 1 slideInFromTop"
                    sx={{
                        "@keyframes slideInFromTop": {
                            "0%": {
                                transform: "scale(0.7)",
                                opacity: 0,
                            },
                            "100%": {
                                transform: "scale(1)",
                                opacity: 1,
                            },
                        },
                    }}
                >
                    {(!serverId || !channelId) && (
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            h="100%"
                            p={4}
                            bg="gray.50"
                        >
                            <Text textAlign="center">
                                {errorMessage || "Discord widget not available"}
                            </Text>
                        </Flex>
                    )}

                    <Button
                        position="absolute"
                        right="10px"
                        top="10px"
                        zIndex={1001}
                        colorScheme="red"
                        size="sm"
                        borderRadius="full"
                        onClick={() => setIsExpanded(false)}
                    >
                        <Icon as={IoClose} />
                    </Button>
                </Box>
            )}
        </>
    );
};

export default ExpandableDiscordWidget;
