import { useMutation } from "@tanstack/react-query";
import { Pencil, Trash } from "lucide-react";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
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
    <section>
      <Heading level={2} className="sr-only">
        Actions
      </Heading>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          icon={<Pencil />}
          text="Duplicate and Edit"
          onClick={() => edit()}
        />
        <Button
          icon={<Trash />}
          text="Delete Analysis"
          design="critical"
          onClick={() => _delete()}
        />
      </div>
    </section>
  );
};

export default Actions;
