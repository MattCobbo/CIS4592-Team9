import { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  Box,
  Button,
  HStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Divider,
  Badge,
  Flex,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { getJobs, createJob, getMyJobs } from "../api/endpoints";
import JobCard from "../components/JobCard";
import CreateJobForm from "../components/CreateJobForm";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "all") {
          const data = await getJobs(1);
          setJobs(data.results);
          setNextPage(data.next ? 2 : null);
        } else {
          const data = await getMyJobs();
          setMyJobs(data);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast({
          title: "Error fetching jobs",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Load more jobs
  const loadMoreJobs = async () => {
    if (!nextPage) return;

    try {
      const data = await getJobs(nextPage);
      setJobs([...jobs, ...data.results]);
      setNextPage(data.next ? nextPage + 1 : null);
    } catch (error) {
      console.error("Error loading more jobs:", error);
      toast({
        title: "Error loading more jobs",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle job creation success
  const onJobCreated = (newJob) => {
    toast({
      title: "Job Created",
      description: "Your job posting has been created successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    // If on my jobs tab, add the new job
    if (activeTab === "my") {
      setMyJobs([newJob, ...myJobs]);
    }
    onClose();
  };

  return (
    <VStack w="100%" p={6} spacing={8} align="start">
      <Heading size="xl">Job Board</Heading>

      <HStack spacing={4}>
        <Button 
          colorScheme={activeTab === "all" ? "blue" : "gray"}
          onClick={() => setActiveTab("all")}
        >
          All Jobs
        </Button>
        <Button 
          colorScheme={activeTab === "my" ? "blue" : "gray"}
          onClick={() => setActiveTab("my")}
        >
          My Jobs
        </Button>
        <Button colorScheme="green" onClick={onOpen}>
          Post a Job
        </Button>
      </HStack>

      <Divider />

      {loading ? (
        <Flex justify="center" w="100%" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : (
        <VStack spacing={4} align="stretch" w="100%">
          {activeTab === "all" ? (
            <>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {nextPage && (
                <Button onClick={loadMoreJobs} colorScheme="blue" variant="outline">
                  Load More
                </Button>
              )}
              {jobs.length === 0 && (
                <Text>No jobs found. Be the first to post a job!</Text>
              )}
            </>
          ) : (
            <>
              {myJobs.map((job) => (
                <JobCard key={job.id} job={job} isOwner={true} />
              ))}
              {myJobs.length === 0 && (
                <Text>You haven't posted any jobs yet.</Text>
              )}
            </>
          )}
        </VStack>
      )}

      {/* Create Job Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Post a New Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CreateJobForm onSuccess={onJobCreated} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default JobBoard;