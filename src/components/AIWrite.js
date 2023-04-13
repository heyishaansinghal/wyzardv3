import React, { useState, useEffect } from "react";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  Stack,
  Skeleton,
  Text,
  Button,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
export default function AIWrite({ aiActive, setAiActive, textContent }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [aiText, setAiText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAIText(textContent).then((generatedText) => {
      setAiText(generatedText);
    });
  }, [textContent]);
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(aiText);
      alert("Text copied to clipboard!");
    } catch (err) {
      alert("Failed to copy text to clipboard.");
    }
  }

  async function getAIText(userContent) {
    const localStorageData = JSON.parse(localStorage.getItem("prompts"));
    const configSettings = JSON.parse(localStorage.getItem("configSettings"));

    const promptToUse =
      "Forget Everything and Summarize this text for SEO And Clarity";
    const apiKey = "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";
    const maxWordsPerRequest = 3000;

    // Split the text into chunks if it exceeds the maximum words per request
    const words = userContent.split(/\s+/);
    const chunks = [];
    while (words.length > 0) {
      chunks.push(words.splice(0, maxWordsPerRequest).join(" "));
    }

    let finalResult = "";
    setIsLoading(true);

    // Process each chunk one by one
    for (const chunk of chunks) {
      const url = "https://api.openai.com/v1/chat/completions";
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `${promptToUse}`,
          },
          { role: "user", content: chunk },
        ],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check for common error status codes and alert the appropriate message
      if (!response.ok) {
        switch (response.status) {
          case 400:
            alert("Bad Request: The request was invalid or cannot be served.");
            break;
          case 401:
            alert("Unauthorized: The request requires authentication.");
            break;
          case 403:
            alert(
              "Forbidden: The server understood the request but refuses to authorize it."
            );
            break;
          case 404:
            alert("Not Found: The requested resource could not be found.");
            break;
          case 429:
            alert("Too Many Requests: You have exceeded the rate limit.");
            break;
          case 500:
            alert(
              "Internal Server Error: The server has encountered an error."
            );
            break;
          case 501:
            alert(
              "Not Implemented: The requested method is not supported by the server."
            );
            break;
          default:
            alert(
              `Error: An unexpected error occurred with status code ${response.status}.`
            );
        }

        return;
      }

      const jsonResponse = await response.json();
      finalResult += jsonResponse.choices[0].message.content;
    }
    setIsLoading(false);

    return finalResult;
  }
  return (
    <Modal onClose={onClose} size={"lg"} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Write</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Stack>
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          ) : (
            <Text>{aiText}</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            onClick={() => {
              onClose();
              setAiActive(!aiActive);
              copyToClipboard();
            }}
          >
            Copy & Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
