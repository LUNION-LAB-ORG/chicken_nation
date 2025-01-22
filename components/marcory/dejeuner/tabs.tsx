"use client";

import {Tabs, Tab} from "@nextui-org/react";

export default function FilterMenu() {

  return (
    <div className="flex flex-wrap justify-center pt-16 gap-2 md:gap-8">
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full">
        <Tab key="dejeuners" title="Déjeuners" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="diners" title="Diners" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="frites" title="Frites" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="menus-italiens" title="Menus italiens" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="menus-libanais" title="Menus libanais" />
        </Tabs>
        <Tabs color="primary" aria-label="Tabs variants" variant="light" radius="full" isDisabled>
        <Tab key="menus-chinois" title="Menus chinois" />
        </Tabs>
    </div>
  );
}
