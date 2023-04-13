import React, { useState } from "react";
import LinkItem from "./LinkItem";
import SearchBar from "./SearchBar";
import { fetchPostsAndPages } from "./Workers/fetchingPage";
import { Text, Flex, Box, Stack, Skeleton } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Center,
  ModalFooter,
  ModalCloseButton,
  ModalHeader,
  useDisclosure,
  Button,
} from "@chakra-ui/react";

export default function WorkerModal({ pages, setPages }) {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [searchValue, setSearchValue] = useState("");
  const [displayedItemsCount, setDisplayedItemsCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  const loadMoreItems = async () => {
    setIsLoadingMore(true);
    try {
      const newPages = await fetchPostsAndPages();
      if (Array.isArray(newPages)) {
        setPages([...pages, ...newPages]);
        setDisplayedItemsCount(displayedItemsCount + newPages.length);
      } else {
        console.error("newPages is not an array:", newPages);
      }
    } catch (error) {
      console.error("Error fetching new pages:", error);
    }
    setIsLoadingMore(false);
  };

  return (
    <Center px={100}>
      <Modal onClose={onClose} size={"full"} isOpen={isOpen}>
        <ModalOverlay />
        <Center>
          <ModalContent>
            <ModalHeader>
              <Text textAlign={"center"} fontSize="2xl" color="teal.700">
                Wyzard
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody maxHeight="70vh" overflowY="auto">
              <Box>
                <SearchBar setSearchValue={setSearchValue} />
                <Flex
                  flexDirection={"column"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  {filteredPages.slice(0, displayedItemsCount).map((page) => {
                    return <LinkItem width={200} page={page}></LinkItem>;
                  })}
                  {isLoadingMore && (
                    <Stack>
                      <Skeleton height="20px" />
                      <Skeleton height="20px" />
                      <Skeleton height="20px" />
                    </Stack>
                  )}
                </Flex>
              </Box>
            </ModalBody>
            <ModalFooter>
              {filteredPages.length > displayedItemsCount}
              <Button
                onClick={loadMoreItems}
                bg="teal.500"
                color="white"
                _hover={{ bg: "teal.600" }}
                w="200px"
                mr={4}
              >
                Load more
              </Button>
              <Button
                onClick={onClose}
                bg="teal.500"
                color="white"
                _hover={{ bg: "teal.600" }}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Center>
      </Modal>
    </Center>
  );
}
