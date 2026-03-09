import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, CheckCircle2, ShoppingBag, Clock, ShieldCheck } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Listing = Tables<"listings">;
type Order = Tables<"orders">;

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      
      // Fetch profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (profData) {
        setProfile(profData);
      }

      // Fetch active listings
      const { data: listData } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      setListings(listData || []);

      // Fetch orders to calculate completion rate
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", userId);
      
      setOrders(orderData || []);
      setLoading(false);
    };

    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <User className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-2xl font-bold mb-2">ইউজার খুঁজে পাওয়া যায়নি</h1>
        <p className="text-muted-foreground mb-6">এই ইউজার প্রোফাইলটি বর্তমানে উপলব্ধ নেই।</p>
        <Link to="/marketplace">
          <Button className="gradient-primary text-primary-foreground border-0">মার্কেটপ্লেসে ফিরে যান</Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const totalOrders = orders.length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const getTrustScore = () => {
    if (totalOrders === 0) return "নতুন বিক্রেতা (New)";
    if (completionRate >= 90 && totalOrders >= 5) return "খুব উচ্চ (Very High)";
    if (completionRate >= 70) return "উচ্চ (High)";
    return "মাঝারি (Medium)";
  };

  const getTrustColor = () => {
    if (totalOrders === 0) return "bg-blue-500/10 text-blue-500";
    if (completionRate >= 70) return "bg-primary/10 text-primary";
    return "bg-yellow-500/10 text-yellow-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center overflow-hidden border-4 border-background shadow-xl shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-primary-foreground" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {profile.full_name || "ইউজার"}
                </h1>
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                  <ShieldCheck className="w-3 h-3" /> ভেরিফাইড সেলার
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-6 max-w-2xl">
                সদস্য হয়েছেন: {new Date(profile.created_at).toLocaleDateString("bn-BD", { year: 'numeric', month: 'long' })}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">অর্ডার সম্পন্ন</p>
                  <p className="text-xl font-bold text-primary">{completionRate}%</p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">মোট বিক্রি</p>
                  <p className="text-xl font-bold text-foreground">{completedOrders}</p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 text-center hidden sm:block">
                  <p className="text-xs text-muted-foreground mb-1">সক্রিয় লিস্টিং</p>
                  <p className="text-xl font-bold text-foreground">{listings.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info */}
          <div className="space-y-6">
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">ইউজার তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTrustColor()}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">ট্রাস্ট স্কোর</p>
                    <p className="font-medium">{getTrustScore()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">গড় রেসপন্স টাইম</p>
                    <p className="font-medium">৩০ মিনিট</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> বিক্রেতার লিস্টিং সমূহ
            </h2>
            
            {listings.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">এই বিক্রেতার কোনো সক্রিয় লিস্টিং নেই।</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`}>
                    <Card className="bg-card border-border hover:border-primary/50 transition-all group h-full">
                      <CardContent className="p-4">
                        <div className="aspect-video rounded-xl bg-muted mb-4 overflow-hidden relative">
                          {listing.images && listing.images[0] ? (
                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-muted-foreground opacity-20" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-border">
                              ৳{listing.price.toLocaleString()}
                            </Badge>
                          </div>
                        </div>
                        <h3 className="font-bold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {listing.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
