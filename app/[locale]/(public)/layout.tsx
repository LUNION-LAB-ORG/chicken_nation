import Footer from "@/components/(public)/common/footer";
import Header from "@/components/(public)/common/header";
import Main from "@/components/primitives/Main";
import "@/styles/globals.css";
import { metadata, organizationSchema } from "../meta";

export { metadata };

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Main className="max-w-screen-2xl mx-auto">
        <Header />
        {children}
        <Footer />
      </Main>
    </>
  );
}
