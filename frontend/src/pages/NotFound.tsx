import { ArrowLeft, SquareDashed } from "lucide-react";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";

const NotFound = () => {
  return (
    <>
      <Meta title="Not Found" />

      <section>
        <Heading level={1} icon={<SquareDashed />}>
          Not Found
        </Heading>

        <p>The page you're looking for doesn't exist!</p>

        <Button to="/" icon={<ArrowLeft />} text="To Home Page" flip />
      </section>
    </>
  );
};

export default NotFound;
