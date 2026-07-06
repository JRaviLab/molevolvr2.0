import { useMutation } from "@tanstack/react-query";
import { Pencil, Trash } from "lucide-react";
import Button from "@/components/Button";
import { H2 } from "@/components/Heading";
import { useAnalysis } from "@/pages/Analysis";

export default function Actions() {
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
    <section className="items-center">
      <H2 className="sr-only">Actions</H2>

      <div className="flex flex-wrap gap-4">
        <Button onClick={() => edit()}>
          <Pencil />
          Duplicate and Edit
        </Button>
        <Button design="critical" onClick={() => _delete()}>
          <Trash />
          Delete Analysis
        </Button>
      </div>
    </section>
  );
}
