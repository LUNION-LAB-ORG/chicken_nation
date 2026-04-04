import { redirect } from "next/navigation";

export default async function AppMobileDownloadPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params as Record<string, string>).toString();

  const destination = queryString
    ? `/app-mobile/deep-link?${queryString}`
    : `/app-mobile/deep-link`;

  redirect(destination);
}