"use client";

import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Label } from "@/shared/components/ui/label";

interface ArrayFieldProps {
  label: string;
  required?: boolean;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function ArrayField({
  label,
  required = false,
  values,
  onChange,
  placeholder = "Legg til...",
}: ArrayFieldProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((value, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1 text-sm flex items-center gap-2"
          >
            {value}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
        <Button type="button" onClick={handleAdd} variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

