import { ChartAreaInteractive } from "@/components/(protected)/dashboard/chart-area-interactive";
import { DataTable } from "@/components/(protected)/dashboard/data-table";
import Content from "@/components/primitives/Content";
import { SectionCards } from "@/components/(protected)/dashboard/section-cards";
import data from "./data.json";

export default async function DashboardPage() {
  return (
    <Content className="flex flex-col gap-4">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </Content>
  );
}
