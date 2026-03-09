import { Search, Facebook, Youtube, Instagram, Gamepad2, ShieldCheck, Lock, Banknote, Users, ArrowRight, TrendingUp, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { CategoryCard } from "@/components/CategoryCard";
import { TrustBadge } from "@/components/TrustBadge";
import { LiveTransaction } from "@/components/LiveTransaction";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

const categories = [
  { icon: Facebook, label: "ফেসবুক পেজ", count: 340, color: "#1877F2", slug: "facebook_page" },
  { icon: Youtube, label: "ইউটিউব চ্যানেল", count: 215, color: "#FF0000", slug: "youtube_channel" },
  { icon: Instagram, label: "ইনস্টাগ্রাম", count: 180, color: "#E4405F", slug: "instagram" },
  { icon: Gamepad2, label: "গেমিং আইডি", count: 120, color: "#9146FF", slug: "gaming_id" },
  { icon: SlidersHorizontal, label: "অন্যান্য", count: 85, color: "#64748b", slug: "other" },
];

const categoryMeta: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  facebook_page: { icon: <Facebook className="w-5 h-5" />, label: "ফেসবুক পেজ", color: "#1877F2" },
  youtube_channel: { icon: <Youtube className="w-5 h-5" />, label: "ইউটিউব চ্যানেল", color: "#FF0000" },
  instagram: { icon: <Instagram className="w-5 h-5" />, label: "ইনস্টাগ্রাম", color: "#E4405F" },
  gaming_id: { icon: <Gamepad2 className="w-5 h-5" />, label: "গেমিং আইডি", color: "#9146FF" },
  other: { icon: <SlidersHorizontal className="w-5 h-5" />, label: "অন্যান্য", color: "#64748b" },
};

const liveTransactions = [
  { buyer: "রহিম", seller: "করিম", item: "FB Page - 50K", amount: "25,000", time: "5 মিনিট আগে" },
  { buyer: "সুমন", seller: "জাহিদ", item: "YT Channel - 30K", amount: "40,000", time: "12 মিনিট আগে" },
  { buyer: "তানভীর", seller: "মিনা", item: "IG Account - 20K", amount: "15,000", time: "25 মিনিট আগে" },
  { buyer: "রাফি", seller: "সাকিব", item: "PUBG ID - Conqueror", amount: "7,500", time: "38 মিনিট আগে" },
];

const trustFeatures = [
  {
    icon: Lock,
    title: "এসক্রো পেমেন্ট সুরক্ষা",
    description: "ক্রেতার টাকা অ্যাডমিনের কাছে নিরাপদ থাকে যতক্ষণ না ডেলিভারি কনফার্ম হয়।",
  },
  {
    icon: ShieldCheck,
    title: "ভেরিফাইড সেলার",
    description: "প্রতিটি বিক্রেতা NID এবং ফোন নম্বর ভেরিফিকেশনের মাধ্যমে যাচাইকৃত।",
  },
  {
    icon: Banknote,
    title: "নিরাপদ পেমেন্ট",
    description: "বিকাশ, নগদ, রকেট এবং USDT/TRX পেমেন্ট মেথড সাপোর্ট।",
  },
];

const stats = [
  { value: "১২,০০০+", label: "সক্রিয় লিস্টিং" },
  { value: "৮,৫০০+", label: "সফল লেনদেন" },
  { value: "৫,০০০+", label: "ভেরিফাইড সেলার" },
  { value: "৯৯.৫%", label: "সন্তুষ্ট ক্রেতা" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (data) setFeaturedListings(data);
      setLoadingListings(false);
    };
    fetchFeatured();
  }, []);

  const handleSearch = () => {
    navigate(`/marketplace${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-2xl">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-xs font-semibold mb-6 border border-primary/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                ১০০% নিরাপদ এসক্রো সিস্টেম
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
              style={{ color: "hsl(0 0% 98%)" }}
            >
              সোশ্যাল মিডিয়া অ্যাকাউন্ট কিনুন ও বিক্রি করুন{" "}
              <span className="text-accent">নিরাপদে</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg mb-8 leading-relaxed"
              style={{ color: "hsl(220 14% 75%)" }}
            >
              বাংলাদেশের সবচেয়ে বিশ্বস্ত ডিজিটাল অ্যাসেট মার্কেটপ্লেস। ফেসবুক পেজ, ইউটিউব চ্যানেল,
              ইনস্টাগ্রাম অ্যাকাউন্ট এবং গেমিং আইডি — সব এক জায়গায়।
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Monetized Channel, OG ID খুঁজুন..."
                  className="pl-12 h-12 bg-card/10 border-border/30 text-primary-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button size="lg" className="h-12 px-8 gradient-primary text-primary-foreground border-0 rounded-xl font-semibold" onClick={handleSearch}>
                খুঁজুন
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-card/5 backdrop-blur-sm border border-border/10">
                  <p className="text-xl font-extrabold text-accent">{stat.value}</p>
                  <p className="text-xs" style={{ color: "hsl(220 14% 65%)" }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">ক্যাটাগরি ব্রাউজ করুন</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">আপনার পছন্দের ক্যাটাগরি থেকে সেরা অ্যাকাউন্ট খুঁজে নিন</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.label} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.4 }}>
                <Link to={`/marketplace?category=${cat.slug}`}>
                  <CategoryCard {...cat} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground mb-2">ফিচার্ড লিস্টিং</h2>
              <p className="text-muted-foreground">সর্বশেষ এবং সেরা অ্যাকাউন্টসমূহ</p>
            </div>
            <Link to="/marketplace">
              <Button variant="outline" className="hidden sm:flex gap-2">
                সব দেখুন <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loadingListings ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-5 animate-pulse h-[200px]" />
              ))
            ) : featuredListings.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                কোনো লিস্টিং পাওয়া যায়নি
              </div>
            ) : (
              featuredListings.map((listing, i) => {
                const meta = categoryMeta[listing.category] || categoryMeta.facebook_page;
                return (
                  <motion.div key={listing.id} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.4 }}>
                    <Link to={`/listing/${listing.id}`}>
                      <ListingCard 
                        type={meta.label}
                        typeIcon={meta.icon}
                        title={listing.title}
                        price={`৳${Number(listing.price).toLocaleString()}`}
                        verified={listing.verified}
                        image={listing.images?.[0]}
                      />
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Trust & Live Transactions */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Trust */}
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-extrabold text-foreground mb-3">কেন আমরা নিরাপদ?</h2>
              <p className="text-muted-foreground mb-8">আপনার প্রতিটি লেনদেন সুরক্ষিত</p>
              <div className="space-y-4">
                {trustFeatures.map((f) => (
                  <TrustBadge key={f.title} {...f} />
                ))}
              </div>
            </motion.div>

            {/* Live Transactions */}
            <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.5 }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <h2 className="text-xl font-bold text-foreground">লাইভ লেনদেন</h2>
              </div>
              <div className="space-y-3">
                {liveTransactions.map((tx, i) => (
                  <LiveTransaction key={i} {...tx} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">কিভাবে কাজ করে?</h2>
            <p className="text-muted-foreground">মাত্র ৩ টি সহজ ধাপে আপনার লেনদেন সম্পন্ন করুন</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "০১", title: "অ্যাকাউন্ট নির্বাচন", desc: "মার্কেটপ্লেস থেকে পছন্দের অ্যাকাউন্ট বেছে নিন এবং বিস্তারিত দেখুন।" },
              { step: "০২", title: "নিরাপদ পেমেন্ট", desc: "এসক্রো সিস্টেমে টাকা জমা দিন — আপনার টাকা অ্যাডমিনের কাছে নিরাপদ।" },
              { step: "০৩", title: "অ্যাকাউন্ট গ্রহণ", desc: "বিক্রেতা অ্যাকাউন্ট ট্রান্সফার করবে, কনফার্ম করলে বিক্রেতাকে টাকা রিলিজ।" },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ delay: i * 0.15, duration: 0.4 }}>
                <div className="glass-card p-6 text-center relative overflow-hidden">
                  <span className="text-6xl font-extrabold text-primary/10 absolute top-2 right-4">
                    {item.step}
                  </span>
                  <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/how-it-works">
              <Button variant="outline" className="gap-2">
                বিস্তারিত জানুন <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "hsl(0 0% 98%)" }}>
              আজই শুরু করুন — বিনামূল্যে রেজিস্ট্রেশন!
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "hsl(220 14% 70%)" }}>
              আপনার সোশ্যাল মিডিয়া অ্যাকাউন্ট বিক্রি করুন অথবা সেরা ডিল-এ কিনুন। নিরাপদ, দ্রুত এবং বিশ্বস্ত।
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/create-listing">
                <Button size="lg" className="gradient-accent text-accent-foreground border-0 font-bold px-8 rounded-xl">
                  বিক্রেতা হিসেবে যোগ দিন
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-border/30 font-bold px-8 rounded-xl" style={{ color: "hsl(0 0% 90%)", borderColor: "hsl(220 14% 40%)" }}>
                  মার্কেটপ্লেস ব্রাউজ করুন
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
