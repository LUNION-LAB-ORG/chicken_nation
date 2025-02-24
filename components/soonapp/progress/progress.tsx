import {Progress} from "@heroui/react";

export default function ProgressCompement() {
  return <Progress aria-label="Loading..." color="primary" size="md" className="max-w-md" value={40} />;
}
