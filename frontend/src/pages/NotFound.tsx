import { LuArrowLeft, LuSquareDashed } from "react-icons/lu";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";

const NotFound = () => {
  return (
    <>
      <Meta title="Not Found" />

      <section>
        <Heading level={1} icon={<LuSquareDashed />}>
          Not Found
        </Heading>

        <p>The page you're looking for doesn't exist!</p>

        <Button to="/" text="To Home Page" icon={<LuArrowLeft />} flip />
      </section>
    </>
  );
};

export default NotFound;
