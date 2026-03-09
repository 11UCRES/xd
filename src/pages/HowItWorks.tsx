import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, CreditCard, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "০১",
    icon: Search,
    title: "অ্যাকাউন্ট খুঁজুন ও নির্বাচন করুন",
    desc: "মার্কেটপ্লেস থেকে আপনার পছন্দের ফেসবুক পেজ, ইউটিউব চ্যানেল, ইনস্টাগ্রাম অ্যাকাউন্ট বা গেমিং আইডি খুঁজে নিন। প্রতিটি লিস্টিং-এ ফলোয়ার, বয়স, এবং রেটিং দেখতে পাবেন।",
    details: [
      "ক্যাটাগরি অনুযায়ী ফিল্টার করুন",
      "মূল্য ও ফলোয়ার অনুযায়ী সর্ট করুন",
      "ভেরিফাইড সেলারদের অগ্রাধিকার দিন",
    ],
  },
  {
    step: "০২",
    icon: CreditCard,
    title: "নিরাপদে পেমেন্ট করুন",
    desc: "বিকাশ, নগদ, রকেট অথবা USDT/TRX-এ পেমেন্ট করুন। আপনার টাকা এসক্রো সিস্টেমে অ্যাডমিনের কাছে নিরাপদ থাকবে। বিক্রেতা সরাসরি টাকা পাবে না।",
    details: [
      "বিকাশ / নগদ / রকেট সাপোর্ট",
      "USDT / TRX ক্রিপ্টো সাপোর্ট",
      "এসক্রো সিস্টেমে ১০০% নিরাপদ",
    ],
  },
  {
    step: "০৩",
    icon: CheckCircle2,
    title: "অ্যাকাউন্ট গ্রহণ করুন",
    desc: "পেমেন্ট ভেরিফাই হলে বিক্রেতা আপনাকে অ্যাকাউন্ট ট্রান্সফার করবে। আপনি কনফার্ম করলে বিক্রেতার কাছে টাকা রিলিজ হবে। সমস্যা হলে ডিসপিউট রেইজ করতে পারবেন।",
    details: [
      "বিক্রেতা অ্যাকাউন্ট ক্রেডেনশিয়াল দেবে",
      "আপনি ভেরিফাই করে কনফার্ম করবেন",
      "সমস্যা হলে রিফান্ড পাবেন",
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-foreground mb-3">কিভাবে কাজ করে?</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">মাত্র ৩ টি সহজ ধাপে আপনার লেনদেন নিরাপদে সম্পন্ন করুন</p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ delay: i * 0.15, duration: 0.4 }}>
                <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                  <span className="text-7xl font-extrabold text-primary/5 absolute top-2 right-6">{item.step}</span>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                      <ul className="space-y-2">
                        {item.details.map((d) => (
                          <li key={d} className="flex items-center gap-2 text-sm text-foreground">
                            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="text-center mt-12">
            <Link to="/marketplace">
              <Button size="lg" className="gradient-primary text-primary-foreground border-0 font-bold px-8 rounded-xl gap-2">
                মার্কেটপ্লেস ব্রাউজ করুন <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
