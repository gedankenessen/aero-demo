import { notFound } from "next/navigation";
import { getDemoPageMetadata, loadDemoPage } from "../../aero/pages";
import { DemoPage } from "../../components/demo-page";

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  return getDemoPageMetadata(slug);
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const demo = await loadDemoPage(slug);
  if (demo === undefined) {
    notFound();
  }
  return <DemoPage {...demo} />;
}
