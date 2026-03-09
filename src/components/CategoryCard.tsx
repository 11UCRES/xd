import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
}

export function CategoryCard({ icon: Icon, label, count, color }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5 text-center cursor-pointer group"
    >
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className="font-bold text-foreground text-sm mb-1">{label}</h3>
      <p className="text-xs text-muted-foreground">{count}+ লিস্টিং</p>
    </motion.div>
  );
}
