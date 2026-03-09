import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Facebook, Youtube, Instagram, Gamepad2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, Clock } from "lucide-react";

const categoryMeta: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  facebook_page: { icon: <Facebook className="w-5 h-5" />, label: "ফেসবুক পেজ", color: "#1877F2" },
  youtube_channel: { icon: <Youtube className="w-5 h-5" />, label: "ইউটিউব চ্যানেল", color: "#FF0000" },
  instagram: { icon: <Instagram className="w-5 h-5" />, label: "ইনস্টাগ্রাম", color: "#E4405F" },
  gaming_id: { icon: <Gamepad2 className="w-5 h-5" />, label: "গেমিং আইডি", color: "#9146FF" },
  other: { icon: <SlidersHorizontal className="w-5 h-5" />, label: "অন্যান্য", color: "#64748b" },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const Marketplace = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchListings();
  }, [category, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*")
      .eq("status", "active");

    if (category !== "all") {
      query = query.eq("category", category as any);
    }

    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "price_low") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price_high") {
      query = query.order("price", { ascending: false });
    }

    const { data, error } = await query;
    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div {...fadeUp} className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">মার্কেটপ্লেস</h1>
            <p className="text-muted-foreground">সেরা সোশ্যাল মিডিয়া অ্যাকাউন্ট খুঁজে নিন</p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div {...fadeUp} className="glass-card p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="অ্যাকাউন্ট খুঁজুন..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="ক্যাটাগরি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                  <SelectItem value="facebook_page">ফেসবুক পেজ</SelectItem>
                  <SelectItem value="youtube_channel">ইউটিউব চ্যানেল</SelectItem>
                  <SelectItem value="instagram">ইনস্টাগ্রাম</SelectItem>
                  <SelectItem value="gaming_id">গেমিং আইডি</SelectItem>
                  <SelectItem value="other">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="সর্ট করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">নতুন আগে</SelectItem>
                  <SelectItem value="price_low">কম দাম আগে</SelectItem>
                  <SelectItem value="price_high">বেশি দাম আগে</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="h-4 bg-secondary rounded mb-3 w-3/4" />
                  <div className="h-3 bg-secondary rounded mb-2 w-1/2" />
                  <div className="h-8 bg-secondary rounded mt-4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">কোনো লিস্টিং পাওয়া যায়নি</p>
              <Link to="/create-listing">
                <Button className="gradient-primary text-primary-foreground border-0">
                  নতুন লিস্টিং তৈরি করুন
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((listing, i) => {
                const meta = categoryMeta[listing.category] || categoryMeta.facebook_page;
                return (
                  <motion.div key={listing.id} {...fadeUp} transition={{ delay: i * 0.05, duration: 0.3 }}>
                    <Link to={`/listing/${listing.id}`}>
                      <div className="glass-card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="h-1.5 gradient-primary" />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}15`, color: meta.color }}>
                                {meta.icon}
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.color }}>{meta.label}</p>
                                <h3 className="text-sm font-bold text-foreground line-clamp-1">{listing.title}</h3>
                              </div>
                            </div>
                            {listing.verified && (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
                                <ShieldCheck className="w-3 h-3" /> Verified
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-3 mb-4">
                            <div className="text-center p-2 rounded-lg bg-secondary/50 flex flex-col justify-center">
                              <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1 text-success" />
                              <p className="text-[10px] text-muted-foreground">নিরাপদ</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">মূল্য</p>
                              <p className="text-lg font-extrabold text-primary">৳{Number(listing.price).toLocaleString()}</p>
                            </div>
                            <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                              বিস্তারিত
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace;
