import React, { useState } from "react";
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Box,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";

const SearchBar = ({ setSearchValue }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event) => {
    setInputValue(event.target.value);
    setSearchValue(event.target.value);
  };

  const clearInput = () => {
    setInputValue("");
    setSearchValue("");
  };

  return (
    <Box width="60%" my={4} mx={"auto"}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="teal.300" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search"
          value={inputValue}
          onChange={handleChange}
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="teal.300"
          _placeholder={{ color: "teal.300" }}
          transition="all 0.3s ease-in-out"
          _hover={{
            borderColor: "teal.500",
          }}
          _focus={{
            borderColor: "teal.500",
            boxShadow: "0 0 0 2px rgba(52, 211, 153, 0.8)",
            bg: "white",
          }}
        />
        {inputValue && (
          <InputRightElement onClick={clearInput} cursor="pointer">
            <CloseIcon color="teal.300" />
          </InputRightElement>
        )}
      </InputGroup>
    </Box>
  );
};

export default SearchBar;
