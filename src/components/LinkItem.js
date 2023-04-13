import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import EditablePage from "./EditablePage";

export default function LinkItem({ page }) {
  const [grammarMistakes, setGrammarMistakes] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const savedFormData = JSON.parse(localStorage.getItem("formInput"));
  let wpAuth = savedFormData.wpAuth;
  let wpusername = wpAuth.split(":")[0];
  let wpPass = wpAuth.split(":")[1];

  function extractTextFromHtml(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Remove script and style tags
    const scriptTags = tempDiv.getElementsByTagName("script");
    const styleTags = tempDiv.getElementsByTagName("style");

    for (let i = scriptTags.length - 1; i >= 0; i--) {
      scriptTags[i].parentNode.removeChild(scriptTags[i]);
    }

    for (let i = styleTags.length - 1; i >= 0; i--) {
      styleTags[i].parentNode.removeChild(styleTags[i]);
    }

    // Select only the <p> elements
    const pTags = tempDiv.getElementsByTagName("p");

    // Extract text content from the <p> elements and join them with a space
    const text = Array.from(pTags)
      .map((p) => p.textContent)
      .join(" ");

    return text;
  }

  async function countGrammarMistakes(rawText) {
    const text = extractTextFromHtml(rawText);
    console.log(text);
    const apiKey = savedFormData.openAIKey;
    const apiEndpoint = "https://api.openai.com/v1/completions";

    const chunkSize = 500;
    const textArray = text.split(" ");
    const chunks = [];

    for (let i = 0; i < textArray.length; i += chunkSize) {
      const chunk = textArray.slice(i, i + chunkSize).join(" ");
      chunks.push(chunk);
    }

    let totalMistakes = 0;

    for (const chunk of chunks) {
      const prompt = `I am an AI language model, and my task is to analyze the following text and provide a numerical score representing the total number of grammar and spelling errors I find. Please note that each type of error has equal weightage, and no specific rules or conventions should be prioritized.

Text: "${chunk}"`;

      const payload = {
        model: "text-davinci-002",
        prompt: prompt,
        temperature: 0.29,
        max_tokens: 64,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        const numberRegex = /\d+/;
        const match = result.choices[0].text.trim().match(numberRegex);

        if (match) {
          totalMistakes += parseInt(match[0], 10);
        } else {
          throw new Error("No score found in the API response.");
        }
      } else {
        throw new Error(result.error.message);
      }
    }

    return totalMistakes;
  }

  useEffect(() => {
    countGrammarMistakes(page.content)
      .then((count) => setGrammarMistakes(count))
      .catch((error) =>
        console.error("Failed to fetch grammar mistakes count:", error)
      );
  }, [page.content]);

  return (
    <>
      <Box
        mt={5}
        cursor="pointer"
        onClick={onOpen}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        transition="transform 0.2s"
        _hover={{
          transform: "scale(1.05)",
          boxShadow: "lg",
          bg: "teal.100",
        }}
        p={6}
        width={500}
      >
        <Text
          fontSize="xl"
          fontWeight="semibold"
          lineHeight="short"
          color="teal.700"
        >
          {page.title}
        </Text>
        {grammarMistakes !== null && (
          <Text fontSize="md" fontWeight="medium" color="yellow.500">
            Potential Issues: {grammarMistakes}
          </Text>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Box>
              <EditablePage
                onClose={onClose}
                postId={page.id}
                username={wpusername}
                password={wpPass}
              ></EditablePage>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
