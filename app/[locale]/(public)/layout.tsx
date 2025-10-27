import Footer from "@/components/(public)/common/footer";
import Header from "@/components/(public)/common/header";
import Main from "@/components/primitives/Main";
import "@/styles/globals.css";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Main className="max-w-screen-2xl mx-auto">
      <Header />
      {children}
      <Footer />
    </Main>
  );
}
