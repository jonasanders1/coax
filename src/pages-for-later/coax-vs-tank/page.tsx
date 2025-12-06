"use client";

import { CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import PageTitle from "@/shared/components/common/PageTitle";
import { comparisonData } from "@/data/comparisonData";

export default function VsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <PageTitle
        title="COAX tankløs vannvarmer vs. tradisjonell tankbereder"
        text="En sammenligning av hvorfor COAX vannberedere gir bedre effektivitet, komfort, hygiene og energisparing"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead>Tankbereder</TableHead>
            <TableHead>COAX</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparisonData.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{row.category}</TableCell>
              <TableCell>
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>{row.tank}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span>{row.coax}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-center mt-12">
        <Button asChild size="lg" className="mr-4">
          <Link href="/kalkulator">Beregn din besparelse nå</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/kontakt">Få gratis råd</Link>
        </Button>
      </div>
    </div>
  );
}
