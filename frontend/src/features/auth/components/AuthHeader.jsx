import { Scissors } from "lucide-react";

export default function AuthHeader({ subtitle }) {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Scissors className="h-10 w-10 text-primary" />
        <span className="text-2xl font-bold text-foreground">Tu Turno Barber</span>
      </div>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}