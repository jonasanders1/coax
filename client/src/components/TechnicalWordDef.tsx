import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "./ui/badge";

const TechnicalWordDef = ({
  children,
  definition,
}: {
  children: React.ReactNode;
  definition: string;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="cursor-help text-inherit" style={{ fontSize: "inherit" }}>
          {children}
        </Badge>
      </TooltipTrigger>

      <TooltipContent>
        <p className="text-sm text-foreground font-medium">{definition}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TechnicalWordDef;
