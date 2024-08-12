import { FaArrowLeft } from "react-icons/fa6";
import { MdBrokenImage } from "react-icons/md";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";

const NotFoundPage = () => {
  return (
    <>
      <Meta title="Not Found" />

      <Section>
        <Heading level={1} icon={<MdBrokenImage />}>
          Not Found
        </Heading>

        <p>The page you're looking for doesn't exist!</p>

        <Button to="/" text="To Home Page" icon={<FaArrowLeft />} flip />
      </Section>
    </>
  );
};

export default NotFoundPage;
