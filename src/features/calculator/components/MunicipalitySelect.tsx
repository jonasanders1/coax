"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Label } from "@/shared/components/ui/label";
import type { WaterPriceData } from "@/shared/lib/api";

interface MunicipalitySelectProps {
  waterPriceData: WaterPriceData | null;
  selectedMunicipality: string | null;
  onSelect: (municipalityCode: string | null) => void;
  disabled?: boolean;
}

export function MunicipalitySelect({
  waterPriceData,
  selectedMunicipality,
  onSelect,
  disabled = false,
}: MunicipalitySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const allMunicipalities = React.useMemo(() => {
    if (!waterPriceData?.municipalities) return [];

    return Object.entries(waterPriceData.municipalities)
      .map(([code, data]) => ({
        code,
        name: data.name,
        waterPrice: data.waterPrice,
        wastewaterPrice: data.wastewaterPrice,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "no"));
  }, [waterPriceData]);

  const municipalities = React.useMemo(() => {
    if (!searchValue.trim()) return allMunicipalities;
    
    const searchLower = searchValue.toLowerCase();
    return allMunicipalities.filter(
      (m) =>
        m.name.toLowerCase().includes(searchLower) ||
        m.code.includes(searchLower)
    );
  }, [allMunicipalities, searchValue]);

  const selectedMunicipalityData = selectedMunicipality
    ? municipalities.find((m) => m.code === selectedMunicipality)
    : null;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="municipality-select" className="text-sm font-medium">
        Kommune
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="municipality-select"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedMunicipalityData
              ? `${selectedMunicipalityData.name} (${selectedMunicipalityData.code})`
              : "Velg kommune..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false} filter={() => 1}>
            <CommandInput 
              placeholder="Søk etter kommune..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Ingen kommune funnet.</CommandEmpty>
              <CommandGroup>
                {municipalities.map((municipality) => {
                  const handleItemSelect = () => {
                    onSelect(municipality.code);
                    setOpen(false);
                  };
                  
                  return (
                    <CommandItem
                      key={municipality.code}
                      value={`${municipality.code} ${municipality.name}`}
                      onSelect={handleItemSelect}
                      onMouseDown={(e) => {
                        // Handle mouse clicks - prevent default to avoid input blur
                        e.preventDefault();
                        handleItemSelect();
                      }}
                      onClick={(e) => {
                        // Also handle click events
                        e.preventDefault();
                        e.stopPropagation();
                        handleItemSelect();
                      }}
                      className="cursor-pointer"
                      disabled={false}
                    >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedMunicipality === municipality.code
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{municipality.name}</span>
                      {(municipality.waterPrice !== null ||
                        municipality.wastewaterPrice !== null) && (
                        <span className="text-xs text-muted-foreground">
                          Vann: {municipality.waterPrice?.toFixed(1) ?? "N/A"}{" "}
                          kr/m³
                          {" • "}
                          Avløp:{" "}
                          {municipality.wastewaterPrice?.toFixed(1) ??
                            "N/A"}{" "}
                          kr/m³
                        </span>
                      )}
                    </div>
                  </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedMunicipalityData && (
        <p className="text-xs text-muted-foreground">
          Vann: {selectedMunicipalityData.waterPrice?.toFixed(2) ?? "N/A"} kr/m³
          {" • "}
          Avløp: {selectedMunicipalityData.wastewaterPrice?.toFixed(2) ??
            "N/A"}{" "}
          kr/m³
        </p>
      )}
    </div>
  );
}
