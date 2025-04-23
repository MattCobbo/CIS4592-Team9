import {
    VStack,
    Box,
    Text,
    Heading,
    Divider,
    Badge,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    HStack,
  } from "@chakra-ui/react";
  
  const ApplicationsList = ({ applications = [] }) => {
    if (applications.length === 0) {
      return <Text>No applications received yet.</Text>;
    }
  
    return (
      <VStack spacing={4} align="stretch">
        <Text mb={2}>
          You have received {applications.length} application{applications.length !== 1 ? "s" : ""}.
        </Text>
        
        <Accordion allowMultiple>
          {applications.map((application) => (
            <AccordionItem key={application.id}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Text fontWeight="bold">{application.applicant_name}</Text>
                      <Badge colorScheme="blue">
                        {application.formatted_application_date}
                      </Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontWeight="bold">Contact Information:</Text>
                    <Text>Email: {application.applicant_email}</Text>
                    <Text>Phone: {application.applicant_phone}</Text>
                  </Box>
                  
                  {application.requested_pay && (
                    <Box>
                      <Text fontWeight="bold">Requested Compensation:</Text>
                      <Text>{application.requested_pay}</Text>
                    </Box>
                  )}
                  
                  <Divider />
                  
                  <Box>
                    <Text fontWeight="bold">Resume / Work Experience:</Text>
                    <Box 
                      p={3} 
                      bg="gray.50" 
                      borderRadius="md" 
                      maxHeight="300px" 
                      overflowY="auto"
                    >
                      <Text whiteSpace="pre-wrap">{application.resume_text}</Text>
                    </Box>
                  </Box>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    );
  };
  
  export default ApplicationsList;