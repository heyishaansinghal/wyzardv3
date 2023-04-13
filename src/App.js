import React, { useState } from "react";
import {
  Box,
  Button,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  useDisclosure,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import ModalHome from "./components/ModalHome";
import { keyframes } from "@chakra-ui/system";

const gradientBG = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "50%": { backgroundPosition: "100% 50%" },
  "100%": { backgroundPosition: "0% 50%" },
});

const verifyLicenseKey = (key) => {
  const webAppUrl =
    "https://script.google.com/macros/s/AKfycbwZUtdE-7lrEomLXVp1dtd4t0zsgiAU7HGRxgEXCB1p0M14Svvu1iw9qz0GFzhCLew/exec";

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${webAppUrl}?key=${encodeURIComponent(key)}`
      );
      const data = await response.json();
      if (data.error) {
        reject(data.error);
      } else {
        const configSettings = {
          key: data.data[0].key,
          domain: data.data[0].domain,
          email: data.data[0].email,
        };
        localStorage.setItem("configSettings", JSON.stringify(configSettings));
        resolve(data.data);
      }
    } catch (error) {
      reject("Fetch error: " + error);
    }
  });
};

function App() {
  const modalOverlayBg = useColorModeValue("blackAlpha.300", "whiteAlpha.300");
  const modalContentBg = useColorModeValue("white", "gray.800");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inputKey, setInputKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(
    JSON.parse(localStorage.getItem("configSettings"))
  );
  let configSettings = JSON.parse(localStorage.getItem("configSettings"));
  const toast = useToast();
  console.log(isVerified);

  return (
    <div className="App">
      <Box
        backgroundImage="linear-gradient(135deg, #68f1d947 0%, #63e7da94 100%)"
        backgroundSize="400% 400%"
        animation={`${gradientBG} 15s ease infinite`}
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        h="calc(100vh)"
      >
        <Center h="calc(100vh)" justifyContent={"center"} alignItems={"center"}>
          <Button
            onClick={onOpen}
            px={20}
            py={8}
            colorScheme="teal"
            variant="outline"
          >
            Let's Go
          </Button>

          <Modal isCentered isOpen={isOpen} onClose={onClose}>
            <ModalOverlay
              bg={modalOverlayBg}
              backdropFilter="blur(10px) hue-rotate(90deg)"
            ></ModalOverlay>
            <ModalContent bg={modalContentBg}>
              <ModalHeader>
                <ModalCloseButton></ModalCloseButton>
              </ModalHeader>
              <ModalBody>
                {!isVerified ? (
                  <form>
                    <FormControl>
                      <FormLabel mt={1} textAlign={"center"}>
                        Enter Your Key
                      </FormLabel>
                      <Input
                        value={inputKey}
                        onChange={(e) => {
                          setInputKey(e.target.value);
                        }}
                        type="text"
                      ></Input>
                      <FormHelperText textAlign={"center"}>
                        Enter Wyzard Key Which You Found in The Email
                      </FormHelperText>
                      <Center>
                        <Button
                          mt={10}
                          justifyContent={"center"}
                          alignItems={"center"}
                          type="submit"
                          isLoading={isLoading}
                          onClick={() => {
                            setIsLoading(!isLoading);
                            verifyLicenseKey(inputKey)
                              .then((data) => {
                                setIsVerified(true);
                                toast({
                                  title: "Success",
                                  description: "License key verified!",
                                  status: "success",
                                  duration: 2000,
                                  isClosable: true,
                                  position: "bottom",
                                });
                                const configSettings = {
                                  key: data.data[0].key,
                                  domain: data.data[0].domain,
                                  email: data.data[0].email,
                                };
                                localStorage.setItem(
                                  "configSettings",
                                  JSON.stringify(configSettings)
                                );
                              })
                              .catch((err) => {
                                console.log(err.message);
                                toast({
                                  title: "Error",
                                  description: "Verification failed",
                                  status: "error",
                                  duration: 2000,
                                  isClosable: true,
                                  position: "bottom",
                                });
                                setIsLoading((e) => {
                                  setIsLoading(!e);
                                  console.log(e);
                                });
                              });
                          }}
                          colorScheme="teal"
                          variant="outline"
                        >
                          Login With Key
                        </Button>
                      </Center>
                    </FormControl>
                  </form>
                ) : (
                  <div>
                    <ModalHome></ModalHome>
                  </div>
                )}
              </ModalBody>
              <ModalFooter></ModalFooter>
            </ModalContent>
          </Modal>
        </Center>
      </Box>
    </div>
  );
}

export default App;
