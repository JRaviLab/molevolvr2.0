import { FaPencil, FaRegTrashCan } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Section from "@/components/Section";
import { useAnalysis } from "@/pages/Analysis";

const Actions = () => {
  const { id } = useAnalysis();

  const { mutate: edit } = useMutation({
    mutationFn: async () => console.debug("edit", id),
  });

  const { mutate: _delete } = useMutation({
    mutationFn: async () => {
      if (
        !window.confirm(
          "Are you sure you want to delete this analysis? This cannot be undone",
        )
      )
        return;
      console.debug("delete", id);
    },
  });

  return (
    <Section>
      <Heading level={2} className="sr-only">
        Actions
      </Heading>

      <Flex>
        <Button
          text="Duplicate and Edit"
          icon={<FaPencil />}
          onClick={() => edit()}
        />
        <Button
          text="Delete Analysis"
          icon={<FaRegTrashCan />}
          design="critical"
          onClick={() => _delete()}
        />
      </Flex>
    </Section>
  );
};

export default Actions;
