import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface LiveTransactionProps {
  buyer: string;
  seller: string;
  item: string;
  amount: string;
  time: string;
}

export function LiveTransaction({ buyer, seller, item, amount, time }: LiveTransactionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50"
    >
      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          <span className="text-primary">{buyer}</span> কিনেছেন{" "}
          <span className="font-bold">{item}</span>
        </p>
        <p className="text-[10px] text-muted-foreground">
          বিক্রেতা: {seller} • {time}
        </p>
      </div>
      <span className="text-xs font-bold text-success whitespace-nowrap">৳{amount}</span>
    </motion.div>
  );
}
