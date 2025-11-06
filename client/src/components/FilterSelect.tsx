// Reusable FilterSelect component
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterSelect = ({
  id,
  label,
  value,
  onValueChange,
  disabled,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  options: { value: string; label: string }[];
  placeholder: string;
}) => (
  <div className="flex flex-col items-start gap-1 md:gap-2">
    <Label htmlFor={id} className="text-sm md:text-lg font-medium ">
      {label}
    </Label>
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default FilterSelect;
