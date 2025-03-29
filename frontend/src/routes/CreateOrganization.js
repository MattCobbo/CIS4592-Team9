import { useState } from "react"
import { createOrganization } from "../api/endpoints"
import { VStack, Heading, Button, Input } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

const CreateOrganization = () => {
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async () => {
        try {
            await createOrganization(name, bio)
            alert("Created organization!")
            navigate("/organizations")
        } catch (err) {
            alert("Error creating organization")
        }
    }

    return (
        <VStack>
            <Heading>Create Organization</Heading>
            <Input
                placeholder="Org Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <Input
                placeholder="Org Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
            <Button onClick={handleSubmit}>Submit</Button>
        </VStack>
    )
}

export default CreateOrganization
