import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDocumentsStore } from "@/lib/stores/documents";
import { Edit } from "lucide-react";
import { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { Button } from "@/components/ui/button";
import { getModel } from "@/lib/ai";
import { getBadLexicalTextContent } from "@/lib/utils";
import { generateText } from "ai";
export function NameEdit({ id }: { id: string }) {
  const { documents, updateDocument } = useDocumentsStore();
  const doc = useMemo(() => documents.find((d) => d.id === id), [documents, id]);
  const debouncedOnChange = useMemo(() => {
    if (!doc) return () => {
      console.error("No document found");
    };
    return debounce((title: string) => updateDocument(doc.id, { title }), 500)
  }, [doc, updateDocument]);
  const [open, setOpen] = useState(false);
  const enableAutoGenerate = useMemo(() => {
    if (!doc) return false;
    return doc.content?.root?.children?.length ?? 0 > 0;
  }, [doc]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-all">
          <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Name</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Input
            type="text"
            value={doc?.title}
            onChange={(e) => debouncedOnChange(e.target.value)}
          />
        </DialogDescription>
        <DialogFooter>
          <Button disabled={!enableAutoGenerate} variant="outline" onClick={async () => {
            if (doc) {
              const model = getModel();
              const content = getBadLexicalTextContent(doc.content!);
              const prompt = "<instructions>You are a helpful assistant that generates a name for a document based on the content. The name should be a couple words that captures the main idea of the document. The name should be no more than 10 words. Do not include any other text in your response.</instructions><content>" + content + "</content>";
              const { text } = await generateText({
                model,
                prompt,
              });
              updateDocument(doc.id, { title: text });
            }
          }}>
            Auto-generate
          </Button>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => {
              if (doc) {
                updateDocument(doc.id, { title: doc.title });
              }
            }}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
