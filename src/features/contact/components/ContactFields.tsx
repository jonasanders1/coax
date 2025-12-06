/**
 * Reusable contact fields component
 * Used in both ContactForm and NeedsAssessmentForm
 */

import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";

interface ContactFieldsProps {
  name: string;
  email: string;
  phone: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  className?: string;
}

export default function ContactFields({
  name,
  email,
  phone,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  className = "",
}: ContactFieldsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="name">
          Navn <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={100}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ditt navn"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">
          E-post <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="din@epost.no"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          maxLength={20}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="123 45 678"
          className="mt-1"
        />
      </div>
    </div>
  );
}

