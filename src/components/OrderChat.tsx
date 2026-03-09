import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Send, Key, Loader2, ShieldCheck, CheckCircle2, AlertTriangle, MessageCircle, X, Check, CheckCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OrderChatProps {
  orderId: string;
  buyerId: string;
  sellerId: string;
  orderStatus: string;
  onOrderComplete?: () => void;
  onClose?: () => void;
  isAdminView?: boolean;
  isFloating?: boolean;
}

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  is_credentials: boolean;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function OrderChat({ 
  orderId, 
  buyerId, 
  sellerId, 
  orderStatus, 
  onOrderComplete, 
  onClose, 
  isAdminView = false,
  isFloating = true 
}: OrderChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCredential, setIsCredential] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [isOpen, setIsOpen] = useState(isFloating);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBuyer = user?.id === buyerId;
  const isSeller = user?.id === sellerId;
  const isParticipant = isBuyer || isSeller;
  const otherUserId = isBuyer ? sellerId : buyerId;

  const hasCredentials = messages.some(m => m.is_credentials);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
    setLoading(false);
  }, [orderId]);

  const markMessagesAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("order_messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  }, [orderId, user]);

  useEffect(() => {
    // Always fetch messages and listen for changes to show notifications
    fetchMessages();

    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // If I'm the recipient and chat is open, mark as read
          if (newMsg.sender_id !== user?.id && isParticipant && !isAdminView && isOpen) {
            markMessagesAsRead();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "order_messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, user?.id, isParticipant, isAdminView, isOpen, fetchMessages, markMessagesAsRead]);

  // Global presence tracking for online status
  useEffect(() => {
    if (!user) return;

    const globalChannel = supabase.channel('global-presence');
    
    const handleSync = () => {
      const state = globalChannel.presenceState();
      const onlineUsers = Object.values(state).flat().map((p: any) => p.user_id);
      setIsOtherOnline(onlineUsers.includes(otherUserId));
    };

    globalChannel
      .on("presence", { event: "sync" }, handleSync)
      .on("presence", { event: "join" }, ({ newPresences }) => {
        const joinedUserIds = newPresences.map((p: any) => p.user_id);
        if (joinedUserIds.includes(otherUserId)) setIsOtherOnline(true);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const leftUserIds = leftPresences.map((p: any) => p.user_id);
        if (leftUserIds.includes(otherUserId)) {
          handleSync();
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await globalChannel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(globalChannel); };
  }, [user, otherUserId]);

  // Mark as read when opening chat
  useEffect(() => {
    if (isOpen && isParticipant && !isAdminView) {
      markMessagesAsRead();
    }
  }, [isOpen, isParticipant, isAdminView, markMessagesAsRead]);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async (customMessage?: string) => {
    const msgText = customMessage || newMessage.trim();
    if (!msgText || !user) return;
    
    setSending(true);
    const { error } = await supabase.from("order_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      message: msgText,
      is_credentials: customMessage ? false : isCredential,
    } as any);
    setSending(false);
    
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      if (!customMessage) {
        setNewMessage("");
        setIsCredential(false);
      }
    }
  };

  const confirmOrder = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("orders")
      .update({ buyer_confirmed: true, status: "completed" as any })
      .eq("id", orderId);
    
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ অর্ডার সম্পন্ন হয়েছে!" });
      // Send automated message
      await sendMessage("অর্ডার সম্পন্ন হয়েছে। ধন্যবাদ!");
      // Close chat
      setIsOpen(false);
      onClose?.();
      onOrderComplete?.();
    }
  };

  const submitReport = async () => {
    if (!reportMessage.trim() || !user) return;
    setReportSending(true);
    const { error } = await supabase.from("reports").insert({
      order_id: orderId,
      reporter_id: user.id,
      message: reportMessage.trim(),
    } as any);
    setReportSending(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ রিপোর্ট পাঠানো হয়েছে", description: "অ্যাডমিন শীঘ্রই দেখবেন।" });
      setReportMessage("");
      setReportOpen(false);
    }
  };

  const getSenderLabel = (senderId: string) => {
    if (senderId === buyerId) return "ক্রেতা";
    if (senderId === sellerId) return "বিক্রেতা";
    return "অ্যাডমিন";
  };

  const getSenderColor = (senderId: string) => {
    if (senderId === buyerId) return "bg-blue-500/20 text-blue-400";
    if (senderId === sellerId) return "bg-emerald-500/20 text-emerald-400";
    return "bg-primary/20 text-primary";
  };

  const getMessageStatus = (msg: Message) => {
    if (msg.sender_id !== user?.id) return null;
    if (msg.is_read) return <span className="text-blue-400 flex items-center gap-0.5"><CheckCheck className="w-3 h-3" /> সিন</span>;
    if (isOtherOnline) return <span className="text-muted-foreground flex items-center gap-0.5"><CheckCheck className="w-3 h-3" /> ডেলিভারড</span>;
    return <span className="text-muted-foreground flex items-center gap-0.5"><Check className="w-3 h-3" /> সেন্ট</span>;
  };

  const canChat = ["payment_confirmed", "delivering", "delivered", "disputed"].includes(orderStatus);

  if (!isOpen && isFloating) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-2xl border-0 z-50 p-0"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        {messages.some(m => !m.is_read && m.sender_id !== user?.id) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
            !
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={`${isFloating ? "fixed bottom-6 right-6 w-[350px] sm:w-[400px] z-50" : "w-full"} max-h-[600px] border border-border rounded-2xl shadow-2xl overflow-hidden bg-card flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gradient-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              অর্ডার চ্যাট
              {isAdminView && <Badge variant="outline" className="text-[10px] bg-white/10 text-white border-white/20">অ্যাডমিন ভিউ</Badge>}
              {!isAdminView && (
                <Link to={`/profile/${otherUserId}`} className="text-[10px] underline opacity-80 hover:opacity-100">
                  প্রোফাইল দেখুন
                </Link>
              )}
            </h4>
            <p className="text-[10px] opacity-80">
              {isOtherOnline ? "🟢 অনলাইনে আছেন" : "⚪ অফলাইন"}
            </p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground hover:bg-white/10" onClick={() => { setIsOpen(false); onClose?.(); }}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-background/50">
        <div className="px-4 py-2 bg-accent/5 border-b border-border flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">অর্ডার আইডি: #{orderId.slice(0, 8)}</span>
          {canChat && isSeller && (
            <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20">
              <Key className="w-2.5 h-2.5" /> ক্রেডেনশিয়াল সক্রিয়
            </Badge>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground px-8">
                {canChat ? "এখনো কোনো মেসেজ নেই। কথোপকথন শুরু করুন!" : "পেমেন্ট কনফার্ম হলে চ্যাট সক্রিয় হবে।"}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {!isMe && (
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSenderColor(msg.sender_id)}`}>
                        {getSenderLabel(msg.sender_id)}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      msg.is_credentials
                        ? "bg-accent/10 border border-accent/30 text-foreground rounded-tr-none"
                        : isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border border-border text-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.is_credentials && (
                      <div className="flex items-center gap-1 text-[10px] text-accent font-semibold mb-1">
                        <Key className="w-3 h-3" /> অ্যাকাউন্ট ক্রেডেনশিয়াল
                      </div>
                    )}
                    <p className={`whitespace-pre-wrap break-words ${msg.is_credentials ? "font-mono text-xs" : ""}`}>
                      {msg.message}
                    </p>
                  </div>
                  {isMe && (
                    <div className="text-[9px] mt-1">
                      {getMessageStatus(msg)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Buyer confirm button */}
        {isBuyer && hasCredentials && !["completed", "refunded", "cancelled"].includes(orderStatus) && (
          <div className="p-3 bg-accent/5 border-t border-border">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-muted-foreground text-center">
                সেলার ক্রেডেনশিয়াল পাঠিয়েছে। চেক করে কনফার্ম করুন।
              </p>
              <Button
                size="sm"
                className="w-full gradient-primary text-primary-foreground border-0 text-xs gap-1"
                onClick={confirmOrder}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> অর্ডার সম্পন্ন করুন
              </Button>
            </div>
          </div>
        )}

        {/* Chat input */}
        {canChat && isParticipant ? (
          <div className="p-3 border-t border-border bg-card">
            {isSeller && (
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCredential}
                  onChange={(e) => setIsCredential(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Key className="w-3 h-3" /> ক্রেডেনশিয়াল হিসেবে পাঠান
                </span>
              </label>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="মেসেজ লিখুন..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="text-sm rounded-xl h-9"
              />
              <Button
                size="icon"
                className="h-9 w-9 gradient-primary text-primary-foreground border-0 shrink-0 rounded-xl"
                onClick={() => sendMessage()}
                disabled={sending || !newMessage.trim()}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="mt-2 flex justify-center">
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/5">
                    <AlertTriangle className="w-3 h-3 mr-1" /> সমস্যা রিপোর্ট করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" /> সমস্যা রিপোর্ট করুন
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      আপনার সমস্যা বিস্তারিত লিখুন। অ্যাডমিন দেখে সমাধান করবেন।
                    </p>
                    <Textarea
                      placeholder="আপনার সমস্যা বর্ণনা করুন..."
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      rows={4}
                    />
                    <Button
                      className="w-full gradient-primary text-primary-foreground border-0"
                      onClick={submitReport}
                      disabled={reportSending || !reportMessage.trim()}
                    >
                      {reportSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      রিপোর্ট পাঠান
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : !canChat ? (
          <div className="p-4 text-center bg-card border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              পেমেন্ট কনফার্ম হলে চ্যাট সক্রিয় হবে
            </p>
          </div>
        ) : isAdminView ? (
          <div className="p-4 text-center bg-card border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              অ্যাডমিন শুধু চ্যাট দেখতে পারবেন
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

