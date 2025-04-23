import { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { createJob } from "../api/endpoints";

const CreateJobForm = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pay, setPay] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!pay.trim()) newErrors.pay = "Pay information is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const jobData = {
        title,
        description,
        pay,
      };
      
      const newJob = await createJob(jobData);
      
      // Call the success callback with the new job data
      if (onSuccess) onSuccess(newJob);
      
      // Reset form
      setTitle("");
      setDescription("");
      setPay("");
      
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={errors.title}>
          <FormLabel htmlFor="title">Job Title</FormLabel>
          <Input
            id="title"
            placeholder="e.g., Frontend Developer, Game Tester"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FormErrorMessage>{errors.title}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.pay}>
          <FormLabel htmlFor="pay">Compensation</FormLabel>
          <Input
            id="pay"
            placeholder="e.g., $20/hr, $60,000-80,000/year"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
          />
          <FormErrorMessage>{errors.pay}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.description}>
          <FormLabel htmlFor="description">Job Description</FormLabel>
          <Textarea
            id="description"
            placeholder="Describe the job responsibilities, requirements, and any other relevant details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <Button
          mt={4}
          colorScheme="blue"
          type="submit"
          isLoading={isSubmitting}
          width="full"
        >
          Post Job
        </Button>
      </VStack>
    </form>
  );
};

export default CreateJobForm;