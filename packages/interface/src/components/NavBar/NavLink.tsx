import { Link, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";

const linkParams: {
  px: number;
  py: number;
  rounded: string;
} = {
  px: 2,
  py: 1,
  rounded: "md",
};

function NavLink({
  url,
  link,
  external,
  isRoute,
  isCurrent,
}: {
  url: string;
  link: string;
  external: boolean;
  isRoute: boolean;
  isCurrent: boolean;
}): JSX.Element {
  const colorModeValue: string = useColorModeValue("gray.200", "gray.700");
  return isRoute ? (
    <NextLink href={url} passHref>
      <Link
        px={linkParams.px}
        py={linkParams.py}
        border={isCurrent ? "1px" : undefined}
        borderColor={isCurrent ? "#00D1FF" : undefined}
        rounded={linkParams.rounded}
        _hover={{
          color: "black",
          textDecoration: "none",
          bg: colorModeValue,
        }}
      >
        {link}
      </Link>
    </NextLink>
  ) : (
    <Link
      px={linkParams.px}
      py={linkParams.py}
      rounded={linkParams.rounded}
      _hover={{
        color: "black",
        textDecoration: "none",
        bg: colorModeValue,
      }}
      href={url}
      isExternal={external}
    >
      {link}
    </Link>
  );
}

export default NavLink;
