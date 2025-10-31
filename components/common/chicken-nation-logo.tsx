import Image from "next/image";

export default function ChickenNationLogo() {
  return (
    <Image
      src="/assets/images/icons/logo.png"
      alt="Chicken Nation Logo"
      width={50}
      height={50}
      priority
      className="cursor-pointer"
    />
  );
}
