import { FaPencil, FaRegTrashCan } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";
import Button from "@/components/Button";
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

      <div className="flex-row gap-sm">
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
      </div>
    </Section>
  );
};

export default Actions;
