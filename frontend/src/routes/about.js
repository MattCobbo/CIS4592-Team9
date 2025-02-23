import { Heading, VStack, Box } from "@chakra-ui/react"

const About = () => {
    return (
        <VStack margin={'60px'}>
            <Heading>About Us</Heading>
            <Box margin={'40px'} maxW={'550px'}>
                <p>
                    LFG is a business networking platform tailored for the professional
                    and independent gaming community. Providing a space
                    for creators and industry leaders to showcase their works and grow
                    their business. Users will be able to post, share, and
                    advertise their creations and organizations while integrating with popular
                    social media platforms.
                </p>
            </Box>
        </VStack>
    )
}

export default About;