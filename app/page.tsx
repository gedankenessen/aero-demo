import { notFound } from "next/navigation";
import { getDemoPageMetadata, loadDemoPage } from "../aero/pages";
import { DemoPage } from "../components/demo-page";

export async function generateMetadata() {
  return getDemoPageMetadata("home");
}

export default async function Page() {
  const demo = await loadDemoPage("home");
  if (demo === undefined) {
    notFound();
  }
  return <DemoPage {...demo} />;
}
