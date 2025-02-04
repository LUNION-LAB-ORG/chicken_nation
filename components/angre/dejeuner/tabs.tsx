"use client";

import {Tabs, Tab} from "@nextui-org/react";

export default function FilterMenu() {

  return (
    <div className="flex flex-wrap justify-center pt-16 gap-2 md:gap-8">
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full">
        <Tab key="poulets-grilles" title="Poulets grillés" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="plats" title="Les plats" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="lunchs" title="Les Lunchs" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="poulet-braise" title="Poulet Braisé" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="burgers-sandwichs" title="Burgers & Swandichs" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="supplements" title="Suppléments" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="grandes-sauces" title="Grandes Sauces" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="boissons" title="Boissons" />
        </Tabs>
    </div>
  );
}
