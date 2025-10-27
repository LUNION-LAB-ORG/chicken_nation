"use client";

import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import Description from "./description";
import Avis from "./avis";

export default function TabComponents() {
  return (
    <div className="flex justify-between items-center w-full flex-col gap-6">
      <Tabs aria-label="Options" variant="underlined" color="primary">
        <Tab key="description" title="Description">
          <Card>
            <CardBody>
              <Description />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="avis" title="Avis(5)">
          <Card>
            <CardBody>
              <Avis />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
