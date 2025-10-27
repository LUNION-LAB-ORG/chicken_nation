import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function ChickenNationLogo() {
  return (
    <Link href="/">
      <Image
        src="/assets/images/icone.png"
        alt="Chicken Nation Logo"
        width={50}
        height={50}
        priority
        className="cursor-pointer"
      />
    </Link>
  );
}
