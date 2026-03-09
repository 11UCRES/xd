import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Facebook, Youtube, Instagram, Gamepad2, ShieldCheck, Users, Clock, ArrowLeft, Wallet, AlertTriangle, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const categoryMeta: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  facebook_page: { icon: <Facebook className="w-6 h-6" />, label: "ফেসবুক পেজ", color: "#1877F2" },
  youtube_channel: { icon: <Youtube className="w-6 h-6" />, label: "ইউটিউব চ্যানেল", color: "#FF0000" },
  instagram: { icon: <Instagram className="w-6 h-6" />, label: "ইনস্টাগ্রাম", color: "#E4405F" },
  gaming_id: { icon: <Gamepad2 className="w-6 h-6" />, label: "গেমিং আইডি", color: "#9146FF" },
  other: { icon: <AlertTriangle className="w-6 h-6" />, label: "অন্যান্য", color: "#64748b" },
};

const paymentMethods = [
  { value: "bkash", label: "বিকাশ", number: "01XXXXXXXXX" },
  { value: "nagad", label: "নগদ", number: "01XXXXXXXXX" },
  { value: "rocket", label: "রকেট", number: "01XXXXXXXXX" },
  { value: "usdt", label: "USDT (TRC20)", number: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { value: "trx", label: "TRX", number: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
];

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderDialog, setOrderDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("is_restricted").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data?.is_restricted) {
          setIsRestricted(true);
        }
      });
    }
  }, [user]);

  const fetchListing = async () => {
    const { data: listingData } = await supabase.from("listings").select("*").eq("id", id).single();
    if (listingData) {
      setListing(listingData);
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", listingData.seller_id)
        .maybeSingle();
      setSellerProfile(profData);
    }
    setLoading(false);
  };

  const handleOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isRestricted) {
      toast({ title: "অ্যাকশন ব্লকড", description: "আপনার অ্যাকাউন্ট রেস্ট্রিক্টেড। আপনি কেনাকাটা করতে পারবেন না।", variant: "destructive" });
      return;
    }
    if (!paymentMethod || !paymentRef.trim()) {
      toast({ title: "ত্রুটি", description: "পেমেন্ট মেথড এবং ট্রানজেকশন আইডি দিন।", variant: "destructive" });
      return;
    }
    setOrdering(true);
    const { error } = await supabase.from("orders").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      amount: listing.price,
      payment_method: paymentMethod as any,
      payment_reference: paymentRef.trim(),
      status: "payment_submitted" as any,
    });
    setOrdering(false);
    if (error) {
      toast({ title: "অর্ডার ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "অর্ডার সফল!", description: "আপনার পেমেন্ট ভেরিফাই করা হবে। অনুগ্রহ করে অপেক্ষা করুন।" });
      setOrderDialog(false);
      setPaymentRef("");
      // Redirect to dashboard orders tab
      setTimeout(() => {
        navigate("/dashboard?tab=orders");
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/3" />
            <div className="h-4 bg-secondary rounded w-1/2" />
            <div className="h-40 bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">লিস্টিং পাওয়া যায়নি</h1>
          <Link to="/marketplace"><Button>মার্কেটপ্লেসে ফিরে যান</Button></Link>
        </div>
      </div>
    );
  }

  const meta = categoryMeta[listing.category] || categoryMeta.facebook_page;
  const selectedPayment = paymentMethods.find((p) => p.value === paymentMethod);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> মার্কেটপ্লেসে ফিরে যান
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
            <div className="h-2 gradient-primary" />
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}15`, color: meta.color }}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.color }}>{meta.label}</span>
                    {listing.verified && (
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-extrabold text-foreground">{listing.title}</h1>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <Wallet className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-xl font-extrabold text-primary">৳{Number(listing.price).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">মূল্য</p>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="mb-6">
                  <h3 className="font-bold text-foreground mb-2">বিবরণ</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {/* Escrow notice */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">এসক্রো সুরক্ষা</p>
                  <p className="text-xs text-muted-foreground">আপনার পেমেন্ট অ্যাডমিনের কাছে নিরাপদ থাকবে যতক্ষণ না আপনি ডেলিভারি কনফার্ম করেন।</p>
                </div>
              </div>

              {/* Seller Profile Link */}
              {sellerProfile && (
                <Link to={`/profile/${sellerProfile.user_id}`} className="block mb-6 p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center overflow-hidden border border-border">
                      {sellerProfile.avatar_url ? (
                        <img src={sellerProfile.avatar_url} alt={sellerProfile.full_name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">বিক্রেতা</p>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {sellerProfile.full_name || "ইউজার"}
                      </p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </Link>
              )}

              {/* Buy button */}
              {user?.id !== listing.seller_id ? (
                <Button
                  size="lg"
                  className="w-full gradient-primary text-primary-foreground border-0 font-bold text-lg h-14"
                  onClick={() => user ? setOrderDialog(true) : navigate("/login")}
                  disabled={listing.status === "sold"}
                >
                  {listing.status === "sold" ? "স্টক আউট (Stock Out)" : `এখনই কিনুন — ৳${Number(listing.price).toLocaleString()}`}
                </Button>
              ) : (
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground">এটি আপনার নিজের লিস্টিং</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={orderDialog} onOpenChange={setOrderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>পেমেন্ট করুন</DialogTitle>
            <DialogDescription>
              নিচের যেকোনো মেথডে ৳{listing ? Number(listing.price).toLocaleString() : ""} পাঠান এবং ট্রানজেকশন আইডি দিন।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>পেমেন্ট মেথড নির্বাচন করুন</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="মেথড বেছে নিন" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPayment && (
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">এই নম্বরে/অ্যাড্রেসে পাঠান:</p>
                <p className="text-sm font-bold text-foreground font-mono">{selectedPayment.number}</p>
                <p className="text-xs text-muted-foreground mt-1">পরিমাণ: ৳{Number(listing.price).toLocaleString()}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>ট্রানজেকশন আইডি / TxHash</Label>
              <Input
                placeholder="যেমন: TxID123456789"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <p>পেমেন্ট পাঠানোর পর অ্যাডমিন ভেরিফাই করবে। কনফার্ম হলে সেলার অ্যাকাউন্ট ট্রান্সফার করবে।</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialog(false)}>বাতিল</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={handleOrder} disabled={ordering}>
              {ordering ? "সাবমিট হচ্ছে..." : "পেমেন্ট সাবমিট করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ListingDetail;
