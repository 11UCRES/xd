import { LucideIcon } from "lucide-react";

interface TrustBadgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function TrustBadge({ icon: Icon, title, description }: TrustBadgeProps) {
  return (
    <div className="flex items-start gap-4 p-5 glass-card">
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <h3 className="font-bold text-foreground text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
