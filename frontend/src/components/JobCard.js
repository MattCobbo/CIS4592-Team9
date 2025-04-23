import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { deleteJob, getJobApplications } from "../api/endpoints";
import ApplyJobForm from "./ApplyJobForm";
import ApplicationsList from "./ApplicationsList";

const JobCard = ({ job, isOwner = false }) => {
  const { isOpen: isApplyOpen, onOpen: onApplyOpen, onClose: onApplyClose } = useDisclosure();
  const { isOpen: isAppsOpen, onOpen: onAppsOpen, onClose: onAppsClose } = useDisclosure();
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Handle view applications
  const handleViewApplications = async () => {
    setLoadingApps(true);
    try {
      const data = await getJobApplications(job.id);
      setApplications(data);
      onAppsOpen();
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Could not load applications",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingApps(false);
    }
  };

  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteJob(job.id);
      toast({
        title: "Job Deleted",
        description: "The job posting has been removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // The parent component should refetch jobs after deletion
      // This could be improved with context or state management
      window.location.reload();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Could not delete job posting",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={5} 
      boxShadow="md"
      bg="white"
      _hover={{ boxShadow: "lg" }}
      transition="0.2s"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" wrap="wrap">
          <Heading size="md">{job.title}</Heading>
          <Badge colorScheme="green" fontSize="sm" p={1}>
            {job.pay}
          </Badge>
        </HStack>
        
        <Text fontSize="sm" color="gray.500">
          Posted by {job.creator_username} on {job.formatted_post_date}
        </Text>
        
        <Divider />
        
        <Text>{job.description}</Text>
        
        <HStack justify="flex-end" pt={2}>
          {isOwner ? (
            <>
              <Button 
                size="sm" 
                colorScheme="blue" 
                onClick={handleViewApplications}
                isLoading={loadingApps}
              >
                View Applications
              </Button>
              <Button 
                size="sm" 
                colorScheme="red" 
                onClick={handleDeleteJob}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </>
          ) : (
            <Button size="sm" colorScheme="green" onClick={onApplyOpen}>
              Apply
            </Button>
          )}
        </HStack>
      </VStack>

      {/* Apply for Job Modal */}
      <Modal isOpen={isApplyOpen} onClose={onApplyClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Apply for: {job.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ApplyJobForm 
              jobId={job.id} 
              onSuccess={() => {
                toast({
                  title: "Application Submitted",
                  description: "Your application has been sent to the job creator",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
                onApplyClose();
              }} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Applications Modal */}
      <Modal isOpen={isAppsOpen} onClose={onAppsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Applications for: {job.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ApplicationsList applications={applications} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default JobCard;