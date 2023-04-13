import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  useColorModeValue,
  VStack,
  HStack,
  useBreakpointValue,
  ScaleFade,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import AIWrite from "./AIWrite";

const EditablePage = ({ postId, username, password, onClose }) => {
  const [copiedContent, setCopiedContent] = useState(null);
  const [aiActive, setAiActive] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef();
  let configSettings = JSON.parse(localStorage.getItem("configSettings"));

  // Add new state for the selected paragraph text
  const [selectedParagraphText, setSelectedParagraphText] = useState("");
  // Add new state for the context menu position
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const fetchPostContent = async (postId) => {
    try {
      const authString = `${username}:${password}`;
      const base64AuthString = btoa(authString);

      const response = await fetch(
        `https://${configSettings.domain}/wp-json/wp/v2/posts/${postId}`,
        {
          headers: {
            Authorization: `Basic ${base64AuthString}`,
          },
        }
      );

      const post = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.content.rendered, "text/html");

      const title = post.title.rendered;
      const headings = Array.from(
        doc.querySelectorAll("h1, h2, h3, h4, h5, h6")
      );
      const postContent = Array.from(doc.querySelectorAll("p, img, iframe"));

      // Process media elements
      postContent.forEach((el, index) => {
        if (el.tagName === "IMG" || el.tagName === "IFRAME") {
          el.style.maxWidth = "100%";
        } else if (el.tagName === "P") {
          const wrappedEl = document.createElement("div");
          wrappedEl.innerHTML = `<grammarly-editor-plugin>${el.outerHTML}</grammarly-editor-plugin>`;
          postContent[index] = wrappedEl;
        }
      });

      // Create a new container element and append the desired elements
      const contentContainer = document.createElement("div");
      const titleElement = contentContainer.appendChild(
        document.createElement("h1")
      );
      titleElement.innerHTML = title;
      titleElement.style.fontWeight = "bold";
      titleElement.style.textAlign = "center";
      titleElement.style.marginBottom = "10px";

      headings.forEach((heading) => contentContainer.appendChild(heading));
      postContent.forEach((content) => contentContainer.appendChild(content));

      // Apply styles to justify and format text
      contentContainer.querySelectorAll("p").forEach((p) => {
        p.style.textAlign = "justify";
        p.style.margin = "1em 0";
        p.style.lineHeight = "1.5";
      });

      // Return the inner HTML of the container element
      return contentContainer.innerHTML;
    } catch (error) {
      throw new Error("Failed to fetch post content");
    }
  };

  useEffect(() => {
    fetchPostContent(postId)
      .then((content) => {
        setCopiedContent(content);
        setIsLoading(false);
        // Extract text content
        let extractedTextContent = "";
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const postContent = Array.from(doc.querySelectorAll("p"));

        postContent.forEach((el) => {
          if (el.tagName === "P") {
            extractedTextContent += el.textContent + "\n\n";
          }
        });

        setTextContent(extractedTextContent);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [postId]);

  useEffect(() => {
    if (copiedContent) {
      contentRef.current
        .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
        .forEach((element) => {
          element.contentEditable = "true";
          element.addEventListener("contextmenu", (event) =>
            handleContextMenu(event, element.textContent)
          );
        });
    }
  }, [copiedContent]);

  // Add event listeners for right-click and click events
  useEffect(() => {
    const handleDocumentClick = (e) => {
      setContextMenuPosition({ x: 0, y: 0 });
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleContextMenu = (event, text) => {
    event.preventDefault();
    setSelectedParagraphText(text);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  };

  // Custom context menu component
  const CustomContextMenu = () => (
    <Box
      position="fixed"
      top={contextMenuPosition.y}
      left={contextMenuPosition.x}
      bg={useColorModeValue("white", "gray.700")}
      boxShadow="md"
      borderRadius="md"
      zIndex={1000}
      padding={2}
    >
      <Button
        size="sm"
        variant="ghost"
        width="100%"
        justifyContent="flex-start"
        onClick={() => {
          setAiActive(true);
          setTextContent(selectedParagraphText);
          setContextMenuPosition({ x: 0, y: 0 });
        }}
        _hover={{
          backgroundColor: useColorModeValue("gray.100", "gray.600"),
        }}
      >
        AI Write
      </Button>
    </Box>
  );

  const saveChanges = async () => {
    if (!copiedContent) return;
    const updatedContent = contentRef.current.innerHTML;

    const authString = `${username}:${password}`;
    const base64AuthString = btoa(authString);
    const response = await fetch(
      `https://${configSettings.domain}/wp-json/wp/v2/posts/${postId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${base64AuthString}`,
        },
        body: JSON.stringify({
          content: {
            raw: updatedContent,
          },
        }),
      }
    );

    if (response.ok) {
      alert("Changes saved successfully!");
    } else {
      alert("Failed to save changes. Please try again.");
    }
  };

  const writeAI = () => {
    setAiActive(!aiActive);
  };

  const buttonHover = useColorModeValue("teal.200", "teal.700");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColor = useColorModeValue("teal.50", "teal.900");
  const borderRadius = "8px";

  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  return (
    <ScaleFade initialScale={0.9} in={true}>
      <Box maxW="container.xl" py={8} mx="auto" px={[4, 6]}>
        {/* Render CustomContextMenu only if position is set */}
        {contextMenuPosition.x !== 0 && <CustomContextMenu />}
        {!aiActive ? (
          isLoading ? (
            <Box padding="6" boxShadow="lg" bg="white">
              <SkeletonCircle size="10" />
              <SkeletonText
                mt="4"
                noOfLines={4}
                spacing="4"
                skeletonHeight="2"
              />
            </Box>
          ) : (
            <VStack
              alignItems={"center"}
              spacing={6}
              bg={bgColor}
              p={6}
              borderRadius={borderRadius}
              w="100%"
            >
              <Box
                ref={contentRef}
                width="100%"
                height="100%"
                overflowY="scroll"
                dangerouslySetInnerHTML={{ __html: copiedContent }}
                sx={{
                  "& h1, & h2, & h3, & h4, & h5, & h6, & p": {
                    color: textColor,
                  },
                }}
              />
              <HStack width="100%" justifyContent={"space-between"}>
                <Button
                  onClick={saveChanges}
                  size={buttonSize}
                  colorScheme="green"
                  _hover={{ bg: buttonHover }}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={writeAI}
                  size={buttonSize}
                  colorScheme="teal"
                  _hover={{ bg: buttonHover }}
                >
                  AI Write
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    setAiActive(!aiActive);
                  }}
                  size={buttonSize}
                  _hover={{ bg: buttonHover }}
                >
                  Close
                </Button>
              </HStack>
            </VStack>
          )
        ) : (
          <div>
            <AIWrite
              setAiActive={setAiActive}
              aiActive={aiActive}
              textContent={textContent}
            />
          </div>
        )}
      </Box>
    </ScaleFade>
  );
};

export default EditablePage;
