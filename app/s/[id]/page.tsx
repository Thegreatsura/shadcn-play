import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { snippets } from "@/lib/db/schema";
import { Playground } from "@/components/playground/playground";

export default async function SharedSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const snippet = await getDb().query.snippets.findFirst({
    where: eq(snippets.id, id),
  });

  if (!snippet) notFound();

  return <Playground initialCode={snippet.code} />;
}
