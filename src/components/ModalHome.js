import {
  Center,
  Input,
  Text,
  Flex,
  Box,
  VStack,
  FormControl,
  FormLabel,
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Container,
  useToast,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { fetchPostsAndPages } from "./Workers/fetchingPage";
import WorkerModal from "./WorkerModal";

export default function ModalHome() {
  let configSettings = JSON.parse(localStorage.getItem("configSettings"));
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [pages, setPages] = useState();
  const storedFormInput = JSON.parse(localStorage.getItem("formInput")) || {};
  const [formInput, setformInput] = useState(storedFormInput);
  const [isInputValid, setIsInputValid] = useState(false);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    onClose();
    toast({
      title: "Logged out",
      description: "You have been logged out.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "bottom",
    });
    window.location.reload();
    localStorage.removeItem("configSettings");
    localStorage.removeItem("formInput");
  };

  useEffect(() => {
    setIsInputValid(
      formInput.wpAuth && formInput.openAIKey && formInput.prompt
    );
  }, [formInput]);

  return (
    <div>
      {!pages ? (
        <Modal onClose={onClose} size={"full"} isOpen={isOpen}>
          <ModalOverlay />
          <Center>
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={10} alignItems="center">
                  <Text
                    bgGradient="linear(to-l, #7928CA, #FF0080)"
                    bgClip="text"
                    textAlign={"center"}
                    fontSize="4xl"
                    fontWeight="extrabold"
                  >
                    Welcome to Wyzard
                  </Text>
                  <Box
                    bg="white"
                    boxShadow="2xl"
                    borderRadius="xl"
                    width={"80%"}
                    padding={10}
                    _hover={{ boxShadow: "dark-lg" }}
                    transition="box-shadow 0.2s ease-in-out"
                  >
                    <Flex justifyContent={"space-around"}>
                      <VStack alignItems="start" spacing={4}>
                        <Text fontSize="lg" fontWeight="bold">
                          Domain: {configSettings.domain}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold">
                          Key: {configSettings.key}
                        </Text>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">
                            Word Press Username
                          </FormLabel>
                          <Input
                            onChange={(e) => {
                              setformInput({
                                ...formInput,
                                wpAuth: e.target.value,
                              });
                            }}
                            value={formInput.wpAuth || ""}
                            placeholder="username:password"
                            size="sm"
                          />
                        </FormControl>
                      </VStack>
                      <VStack alignItems="start" spacing={4}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">OPEN AI Key</FormLabel>
                          <Input
                            onChange={(e) => {
                              setformInput({
                                ...formInput,
                                openAIKey: e.target.value,
                              });
                            }}
                            value={formInput.openAIKey || ""}
                            placeholder="sk-XXXXXX XXXXXX"
                            size="sm"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Prompt for AI Use</FormLabel>
                          <Input
                            onChange={(e) => {
                              setformInput({
                                ...formInput,
                                prompt: e.target.value,
                              });
                            }}
                            value={
                              formInput.prompt ||
                              "Optimize this Text for More Clarity and SEO"
                            }
                            size="sm"
                          />
                        </FormControl>
                      </VStack>
                    </Flex>
                  </Box>
                  <Button
                    onClick={async () => {
                      if (!isInputValid) {
                        toast({
                          title: "Error",
                          description: "Please fill in all required fields.",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }
                      setIsLoading(true);
                      const newPages = await fetchPostsAndPages();
                      setPages(newPages);
                      localStorage.setItem(
                        "formInput",
                        JSON.stringify(formInput)
                      );
                      setIsLoading(false);
                    }}
                    size={"lg"}
                    colorScheme="teal"
                    variant="outline"
                    isLoading={isLoading}
                  >
                    Launch
                  </Button>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button onClick={handleLogout}>Logout & Close</Button>
              </ModalFooter>
            </ModalContent>
          </Center>
        </Modal>
      ) : (
        <div>
          {console.log(pages)}
          <WorkerModal setPages={setPages} pages={pages}></WorkerModal>
        </div>
      )}
    </div>
  );
}
