import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "ত্রুটি", description: "মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।", variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "আপনার মেসেজ পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।" });
      setName(""); setEmail(""); setSubject(""); setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">যোগাযোগ করুন</h1>
            <p className="text-muted-foreground">আমাদের সাথে যেকোনো প্রশ্নে যোগাযোগ করুন</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Mail, title: "ইমেইল", value: "support@saem.com" },
              { icon: Phone, title: "ফোন", value: "+880 1XXX-XXXXXX" },
              { icon: MapPin, title: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
            ].map((item) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 text-center">
                <div className="w-12 h-12 rounded-xl gradient-primary mx-auto mb-3 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">মেসেজ পাঠান</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">নাম *</Label>
                  <Input id="name" placeholder="আপনার নাম" value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল *</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">বিষয়</Label>
                <Input id="subject" placeholder="বিষয় লিখুন" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">মেসেজ *</Label>
                <Textarea id="message" placeholder="আপনার মেসেজ লিখুন..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required maxLength={5000} />
              </div>
              <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 font-semibold gap-2" disabled={loading}>
                <Send className="w-4 h-4" />
                {loading ? "পাঠানো হচ্ছে..." : "মেসেজ পাঠান"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
