import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(), // do not run this query on the server
  });
  let body = null;

  console.log("data: ", data);

  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href={"/login"} style={{ marginRight: "20px" }}>
          Login
        </NextLink>
        <NextLink href={"/register"}>Register</NextLink>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex>
        <Box mr={4}>{data.me.username}</Box>
        <Button
          variant={"link"}
          onClick={() => {
            logout({});
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" position="sticky" top={0} p={4} zIndex={1}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
