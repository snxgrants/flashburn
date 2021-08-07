import { ReactNode } from "react";
import { Heading, HeadingProps } from "@chakra-ui/react";

function Header({
  children,
  props,
}: {
  children: ReactNode;
  props?: HeadingProps;
}): JSX.Element {
  return (
    <Heading
      as="h1"
      fontSize={{ base: "xl", md: "3xl" }}
      margin={1}
      marginBottom={5}
      textAlign="center"
      {...props}
    >
      {children}
    </Heading>
  );
}

export default Header;
