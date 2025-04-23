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
import { applyForJob } from "../api/endpoints";

const ApplyJobForm = ({ jobId, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestedPay, setRequestedPay] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Invalid email format";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!resumeText.trim()) newErrors.resumeText = "Resume text is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log("Submitting application for job ID:", jobId);
      
      const applicationData = {
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        requested_pay: requestedPay,
        resume_text: resumeText,
      };
      
      console.log("Application data:", applicationData);
      
      await applyForJob(jobId, applicationData);
      
      // Call the success callback
      if (onSuccess) onSuccess();
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setRequestedPay("");
      setResumeText("");
      
    } catch (error) {
      console.error("Error applying for job:", error);
      console.error("Error details:", error.response?.data || "No details available");
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
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
        <FormControl isInvalid={errors.name}>
          <FormLabel htmlFor="name">Full Name</FormLabel>
          <Input
            id="name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.email}>
          <FormLabel htmlFor="email">Email Address</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.phone}>
          <FormLabel htmlFor="phone">Phone Number</FormLabel>
          <Input
            id="phone"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FormErrorMessage>{errors.phone}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="requestedPay">Requested Compensation (optional)</FormLabel>
          <Input
            id="requestedPay"
            placeholder="e.g., $25/hr, $70,000/year"
            value={requestedPay}
            onChange={(e) => setRequestedPay(e.target.value)}
          />
        </FormControl>

        <FormControl isInvalid={errors.resumeText}>
          <FormLabel htmlFor="resumeText">Resume / Work Experience</FormLabel>
          <Textarea
            id="resumeText"
            placeholder="Paste your resume or describe your relevant experience here"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
          />
          <FormErrorMessage>{errors.resumeText}</FormErrorMessage>
        </FormControl>

        <Button
          mt={4}
          colorScheme="green"
          type="submit"
          isLoading={isSubmitting}
          width="full"
        >
          Submit Application
        </Button>
      </VStack>
    </form>
  );
};

export default ApplyJobForm;