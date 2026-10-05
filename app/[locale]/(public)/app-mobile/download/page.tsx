import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function AppMobileDownloadPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  setRequestLocale((await params).locale);
  const parametres = await searchParams;
  const queryString = new URLSearchParams(
    parametres as Record<string, string>,
  ).toString();

  const destination = queryString
    ? `/app-mobile/deep-link?${queryString}`
    : `/app-mobile/deep-link`;

  redirect(destination);
}
