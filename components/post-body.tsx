import markdownToHtml from "@/lib/markdown";

type Props = {
  markdown: string;
};

export async function PostBody({ markdown }: Props) {
  const content = await markdownToHtml(markdown);
  return (
    <div className="max-w-2xl mx-auto prose prose-slate dark:prose-invert mt-20">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
