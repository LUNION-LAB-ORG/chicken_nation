import { redirect } from "next/navigation";

export default async function AppMobileDownloadPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const queryString = new URLSearchParams(searchParams as Record<string, string>).toString();

  const destination = queryString
    ? `/app-mobile/deep-link?${queryString}`
    : `/app-mobile/deep-link`;

  redirect(destination);
}