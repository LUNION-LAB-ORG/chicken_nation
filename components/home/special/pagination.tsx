import {Pagination} from "@nextui-org/react";

export default function JumpPage() {
  return <Pagination className="text-primary-900" showControls initialPage={1} total={3} radius="full" />;
}
