import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, Package, Users, MessageSquare, BarChart3, Loader2, Trash2, ChevronDown, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { OrderChat } from "@/components/OrderChat";

type Order = Tables<"orders">;
type Listing = Tables<"listings">;
type Profile = Tables<"profiles">;
type ContactMessage = Tables<"contact_messages">;
type UserRole = Tables<"user_roles">;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  payment_submitted: "bg-blue-500/20 text-blue-400",
  payment_confirmed: "bg-emerald-500/20 text-emerald-400",
  delivering: "bg-purple-500/20 text-purple-400",
  delivered: "bg-cyan-500/20 text-cyan-400",
  completed: "bg-green-500/20 text-green-400",
  disputed: "bg-red-500/20 text-red-400",
  refunded: "bg-orange-500/20 text-orange-400",
  cancelled: "bg-muted text-muted-foreground",
  active: "bg-green-500/20 text-green-400",
  sold: "bg-blue-500/20 text-blue-400",
  removed: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "পেন্ডিং",
  payment_submitted: "পেমেন্ট জমা",
  payment_confirmed: "পেমেন্ট কনফার্ম",
  delivering: "ডেলিভারিং",
  delivered: "ডেলিভার্ড",
  completed: "সম্পন্ন",
  disputed: "ডিসপিউটেড",
  refunded: "রিফান্ডেড",
  cancelled: "বাতিল",
  active: "সক্রিয়",
  sold: "বিক্রিত",
  removed: "মুছে ফেলা",
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (!data) { navigate("/"); toast({ title: "অ্যাক্সেস নেই", description: "আপনি অ্যাডমিন নন।", variant: "destructive" }); }
      else setIsAdmin(true);
      setChecking(false);
    });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoadingData(true);
      const [o, l, p, r, m, rp] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("listings").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("reports").select("*").order("created_at", { ascending: false }),
      ]);
      setOrders(o.data || []);
      setListings(l.data || []);
      setProfiles(p.data || []);
      setRoles(r.data || []);
      setMessages(m.data || []);
      setReports((rp.data as any[]) || []);
      setLoadingData(false);
    };
    load();
  }, [isAdmin]);

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
      toast({ title: "আপডেট হয়েছে" });
    }
  };

  const updateOrderNotes = async (id: string, notes: string) => {
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", id);
  };

  const updateListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: status as any } : l));
      toast({ title: "আপডেট হয়েছে" });
    }
  };

  const toggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.from("listings").update({ verified: !current }).eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setListings(prev => prev.map(l => l.id === id ? { ...l, verified: !current } : l));
      toast({ title: !current ? "ভেরিফাইড করা হয়েছে" : "ভেরিফিকেশন সরানো হয়েছে" });
    }
  };

  const toggleRestriction = async (userId: string, current: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_restricted: !current } as any).eq("user_id", userId);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setProfiles(prev => prev.map(p => p.user_id === userId ? { ...p, is_restricted: !current } : p));
      toast({ title: !current ? "ইউজারকে রেস্ট্রিক্টেড করা হয়েছে" : "রেস্ট্রিকশন সরানো হয়েছে" });
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const existing = roles.find(r => r.user_id === userId);
    if (existing) {
      const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("id", existing.id);
      if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
      else {
        setRoles(prev => prev.map(r => r.id === existing.id ? { ...r, role: newRole as any } : r));
        toast({ title: "রোল আপডেট হয়েছে" });
      }
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে" });
    }
  };

  const getProfileName = (userId: string) => {
    const p = profiles.find(p => p.user_id === userId);
    return p?.full_name || userId.slice(0, 8);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "buyer";

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.amount), 0);
  const pendingOrders = orders.filter(o => ["pending", "payment_submitted"].includes(o.status)).length;
  const activeListings = listings.filter(l => l.status === "active").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">অ্যাডমিন ড্যাশবোর্ড</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "মোট অর্ডার", value: orders.length, icon: Package },
            { label: "পেন্ডিং অর্ডার", value: pendingOrders, icon: Package },
            { label: "সক্রিয় লিস্টিং", value: activeListings, icon: BarChart3 },
            { label: "মোট রেভিনিউ", value: `৳${totalRevenue.toLocaleString()}`, icon: BarChart3 },
          ].map((s, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loadingData ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="orders">
            <TabsList className="mb-6 bg-muted flex-wrap">
              <TabsTrigger value="orders">অর্ডার ({orders.length})</TabsTrigger>
              <TabsTrigger value="listings">লিস্টিং ({listings.length})</TabsTrigger>
              <TabsTrigger value="users">ইউজার ({profiles.length})</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> রিপোর্ট ({reports.length})
              </TabsTrigger>
              <TabsTrigger value="messages">মেসেজ ({messages.length})</TabsTrigger>
            </TabsList>

            {/* ORDERS TAB */}
            <TabsContent value="orders">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>সকল অর্ডার</CardTitle></CardHeader>
                <CardContent>
                  {orders.length === 0 ? <p className="text-muted-foreground text-center py-8">কোনো অর্ডার নেই</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>তারিখ</TableHead>
                            <TableHead>ক্রেতা</TableHead>
                            <TableHead>বিক্রেতা</TableHead>
                            <TableHead>পরিমাণ</TableHead>
                            <TableHead>পেমেন্ট</TableHead>
                            <TableHead>রেফারেন্স</TableHead>
                            <TableHead>স্ট্যাটাস</TableHead>
                            <TableHead>নোট</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map(order => (
                            <React.Fragment key={order.id}>
                            <TableRow>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(order.created_at).toLocaleDateString("bn-BD")}</TableCell>
                              <TableCell className="text-sm">{getProfileName(order.buyer_id)}</TableCell>
                              <TableCell className="text-sm">{getProfileName(order.seller_id)}</TableCell>
                              <TableCell className="font-semibold">৳{Number(order.amount).toLocaleString()}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{order.payment_method}</Badge></TableCell>
                              <TableCell className="text-xs max-w-[120px] truncate">{order.payment_reference || "—"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {order.status === "payment_submitted" && (
                                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateOrderStatus(order.id, "payment_confirmed")}>
                                      ✓ পেমেন্ট কনফার্ম
                                    </Button>
                                  )}
                                  <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {["pending","payment_submitted","payment_confirmed","delivering","delivered","completed","disputed","refunded","cancelled"].map(s => (
                                        <SelectItem key={s} value={s}>{statusLabels[s] || s}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Textarea
                                    className="min-w-[150px] text-xs h-8"
                                    placeholder="অ্যাডমিন নোট..."
                                    defaultValue={order.admin_notes || ""}
                                    onBlur={(e) => updateOrderNotes(order.id, e.target.value)}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 shrink-0"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                  >
                                    💬 চ্যাট
                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedOrder === order.id && (
                              <TableRow>
                                <TableCell colSpan={8} className="p-4">
                                  <OrderChat
                                    orderId={order.id}
                                    buyerId={order.buyer_id}
                                    sellerId={order.seller_id}
                                    orderStatus={order.status}
                                    isAdminView={true}
                                    isFloating={false}
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* LISTINGS TAB */}
            <TabsContent value="listings">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>সকল লিস্টিং</CardTitle></CardHeader>
                <CardContent>
                  {listings.length === 0 ? <p className="text-muted-foreground text-center py-8">কোনো লিস্টিং নেই</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>শিরোনাম</TableHead>
                            <TableHead>ক্যাটাগরি</TableHead>
                            <TableHead>মূল্য</TableHead>
                            <TableHead>বিক্রেতা</TableHead>
                            <TableHead>ভেরিফাইড</TableHead>
                            <TableHead>স্ট্যাটাস</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {listings.map(listing => (
                            <TableRow key={listing.id}>
                              <TableCell className="font-medium max-w-[200px] truncate">{listing.title}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{listing.category}</Badge></TableCell>
                              <TableCell className="font-semibold">৳{Number(listing.price).toLocaleString()}</TableCell>
                              <TableCell className="text-sm">{getProfileName(listing.seller_id)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant={listing.verified ? "default" : "outline"} className="text-xs h-7" onClick={() => toggleVerified(listing.id, listing.verified)}>
                                  {listing.verified ? "✓ ভেরিফাইড" : "ভেরিফাই করুন"}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Select value={listing.status} onValueChange={(v) => updateListingStatus(listing.id, v)}>
                                  <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {["active","pending","sold","removed"].map(s => (
                                      <SelectItem key={s} value={s}>{statusLabels[s] || s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>সকল ইউজার</CardTitle></CardHeader>
                <CardContent>
                  {profiles.length === 0 ? <p className="text-muted-foreground text-center py-8">কোনো ইউজার নেই</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ছবি</TableHead>
                            <TableHead>নাম</TableHead>
                            <TableHead>ফোন</TableHead>
                            <TableHead>যোগদান</TableHead>
                            <TableHead>রোল</TableHead>
                            <TableHead>রেস্ট্রিকশন</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profiles.map(profile => (
                            <TableRow key={profile.id}>
                              <TableCell>
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                  {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <Link to={`/profile/${profile.user_id}`} className="hover:text-primary hover:underline transition-colors">
                                  {profile.full_name || "—"}
                                </Link>
                              </TableCell>
                              <TableCell className="text-sm">{profile.phone || "—"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{new Date(profile.created_at).toLocaleDateString("bn-BD")}</TableCell>
                              <TableCell>
                                <Select value={getUserRole(profile.user_id)} onValueChange={(v) => changeUserRole(profile.user_id, v)}>
                                  <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="buyer">Buyer</SelectItem>
                                    <SelectItem value="seller">Seller</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant={profile.is_restricted ? "destructive" : "outline"} 
                                  className="text-xs h-7"
                                  onClick={() => toggleRestriction(profile.user_id, !!profile.is_restricted)}
                                >
                                  {profile.is_restricted ? "🔴 রেস্ট্রিক্টেড" : "রেস্ট্রিক্ট করুন"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* REPORTS TAB */}
            <TabsContent value="reports">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> সকল রিপোর্ট</CardTitle></CardHeader>
                <CardContent>
                  {reports.length === 0 ? <p className="text-muted-foreground text-center py-8">কোনো রিপোর্ট নেই</p> : (
                    <div className="space-y-4">
                      {reports.map((report: any) => (
                        <div key={report.id} className="p-4 rounded-lg border border-border bg-muted/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline" className={`text-xs ${report.status === 'open' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                                  {report.status === 'open' ? '🔴 খোলা' : '✅ সমাধান'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  রিপোর্টার: <span className="text-foreground font-medium">{getProfileName(report.reporter_id)}</span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  অর্ডার #{report.order_id?.slice(0, 8).toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-foreground mb-2">{report.message}</p>
                              <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString("bn-BD")}</p>

                              {report.admin_reply && (
                                <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                                  <p className="text-xs text-primary font-semibold mb-1">অ্যাডমিন উত্তর:</p>
                                  <p className="text-sm text-foreground">{report.admin_reply}</p>
                                </div>
                              )}

                              <div className="mt-3 flex items-center gap-2">
                                <Textarea
                                  className="text-xs min-h-[60px]"
                                  placeholder="উত্তর লিখুন..."
                                  defaultValue={report.admin_reply || ""}
                                  id={`reply-${report.id}`}
                                />
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={async () => {
                                      const reply = (document.getElementById(`reply-${report.id}`) as HTMLTextAreaElement)?.value;
                                      const { error } = await supabase.from("reports").update({ admin_reply: reply, status: 'resolved' } as any).eq("id", report.id);
                                      if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
                                      else {
                                        setReports(prev => prev.map(r => r.id === report.id ? { ...r, admin_reply: reply, status: 'resolved' } : r));
                                        toast({ title: "উত্তর পাঠানো হয়েছে" });
                                      }
                                    }}
                                  >
                                    উত্তর দিন
                                  </Button>
                                  {report.status === 'open' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7"
                                      onClick={async () => {
                                        await supabase.from("reports").update({ status: 'resolved' } as any).eq("id", report.id);
                                        setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r));
                                        toast({ title: "সমাধান করা হয়েছে" });
                                      }}
                                    >
                                      সমাধান
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MESSAGES TAB */}
            <TabsContent value="messages">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>যোগাযোগ মেসেজ</CardTitle></CardHeader>
                <CardContent>
                  {messages.length === 0 ? <p className="text-muted-foreground text-center py-8">কোনো মেসেজ নেই</p> : (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div key={msg.id} className="p-4 rounded-lg border border-border bg-muted/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">{msg.name}</span>
                                <span className="text-xs text-muted-foreground">{msg.email}</span>
                              </div>
                              {msg.subject && <p className="text-sm font-medium text-foreground mb-1">{msg.subject}</p>}
                              <p className="text-sm text-muted-foreground">{msg.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString("bn-BD")}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMessage(msg.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
