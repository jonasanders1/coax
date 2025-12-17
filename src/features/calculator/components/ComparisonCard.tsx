"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { DollarSign, Zap, Droplet } from "lucide-react";
import type { CalculationResults } from "@/features/calculator/lib/calculator";

interface ComparisonCardProps {
  title: string;
  description: string;
  gradientStyle: string;
  results: {
    totalCostPerYearNOK: number;
    energyCostPerYearNOK: number;
    waterCostPerYearNOK: number;
    kwhPerYear: number;
    dailyVolume: number;
    waitWaterWastePerYear: number;
  };
}

export function ComparisonCard({
  title,
  description,
  gradientStyle,
  results,
}: ComparisonCardProps) {
  return (
    <Card
      className="shadow-lg overflow-hidden relative"
      style={{ background: gradientStyle }}
    >
      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
      <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {title}
        </CardTitle>
        <CardDescription className="text-white/90">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {/* Total Cost - Full Width */}
        <div className="bg-black/10 backdrop-blur-sm rounded-lg p-4 borde">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-white" />
            <p className="text-sm font-medium text-white">
              Total årlig kostnad
            </p>
          </div>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {results.totalCostPerYearNOK.toLocaleString("no-NO", {
              maximumFractionDigits: 0,
            })}{" "}
            kr
          </p>
        </div>

        {/* Cost Breakdown - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-4 h-4 text-white" />
              <p className="text-xs text-white/90">Strømkostnad</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {results.energyCostPerYearNOK.toLocaleString("no-NO", {
                maximumFractionDigits: 0,
              })}{" "}
              kr
            </p>
          </div>
          <div className="bg-black/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Droplet className="w-4 h-4 text-white" />
              <p className="text-xs text-white/90">Vannkostnad</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {results.waterCostPerYearNOK.toLocaleString("no-NO", {
                maximumFractionDigits: 0,
              })}{" "}
              kr
            </p>
          </div>
        </div>

        {/* Usage Metrics - 3 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-black/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-4 h-4 text-white" />
              <p className="text-xs text-white/90">Energibruk</p>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-white">
              {results.kwhPerYear.toFixed(0)} kWh
            </p>
          </div>
          <div className="bg-black/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Droplet className="w-4 h-4 text-white" />
              <p className="text-xs text-white/90">Daglig</p>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-white">
              {results.dailyVolume.toFixed(0)} L
            </p>
          </div>
          <div className="bg-black/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Droplet className="w-4 h-4 text-white" />
              <p className="text-xs text-white/90">Ventetap (L/år)</p>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-white">
              {results.waitWaterWastePerYear > 0
                ? results.waitWaterWastePerYear.toFixed(0)
                : "0"}{" "}
              L
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
