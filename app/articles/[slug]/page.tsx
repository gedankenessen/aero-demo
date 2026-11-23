import { notFound, redirect } from "next/navigation";
import { loadDemoPage } from "../../../aero/pages";

export default async function Page({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const demo = await loadDemoPage(slug);
  if (demo?.page.content.type !== "pageArticle") {
    notFound();
  }
  redirect(`/${encodeURIComponent(slug)}`);
}
