import { IconTrendingUp } from "@tabler/icons-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  playkids: number;
  coaches: number;
  sports: number;
  branches: number;
};

function numberWithCommas(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function SectionCards({ playkids, coaches, sports, branches }: Props) {
  return (
    <div className="*:data-[slot=card]:from-secondary/10 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>PlayKids</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {numberWithCommas(playkids)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total registered PlayKids
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Current active PlayKids count
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Coaches</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {numberWithCommas(coaches)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered coaches <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Active staff in branches</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sports</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {numberWithCommas(sports)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sports offered <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Different sports categories</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Branches</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {numberWithCommas(branches)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active branches <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Physical venues / branches</div>
        </CardFooter>
      </Card>
    </div>
  );
}
