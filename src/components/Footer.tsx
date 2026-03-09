import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">SAEM</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              সোশ্যাল মিডিয়া অ্যাকাউন্ট ও ডিজিটাল অ্যাসেট কেনা-বেচার নিরাপদ মার্কেটপ্লেস।
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-sm mb-4">মার্কেটপ্লেস</h4>
            <ul className="space-y-2">
              {[
                { label: "ফেসবুক পেজ", href: "/marketplace?category=facebook_page" },
                { label: "ইউটিউব চ্যানেল", href: "/marketplace?category=youtube_channel" },
                { label: "ইনস্টাগ্রাম", href: "/marketplace?category=instagram" },
                { label: "গেমিং আইডি", href: "/marketplace?category=gaming_id" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-sm mb-4">সাপোর্ট</h4>
            <ul className="space-y-2">
              {[
                { label: "কিভাবে কাজ করে", href: "/how-it-works" },
                { label: "এসক্রো সিস্টেম", href: "/how-it-works" },
                { label: "প্রাইভেসি পলিসি", href: "/contact" },
                { label: "যোগাযোগ", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-sm mb-4">পেমেন্ট মেথড</h4>
            <div className="flex flex-wrap gap-2">
              {["বিকাশ", "নগদ", "রকেট", "USDT", "TRX"].map((method) => (
                <span
                  key={method}
                  className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 SAEM - Social Account Exchange & Marketplace। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
}
