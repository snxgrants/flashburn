import { Link, Text, TextProps } from "@chakra-ui/react";

function ExternalLink({
  href,
  text,
  props,
}: {
  href: string;
  text: string;
  props?: TextProps;
}): JSX.Element {
  return (
    <Link href={href} isExternal>
      <Text as="u" {...props}>
        {text}
      </Text>
    </Link>
  );
}

export default ExternalLink;
