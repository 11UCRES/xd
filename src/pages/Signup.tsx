import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { ShoppingBag, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisposableEmail(email)) {
      toast({ title: "ত্রুটি", description: "অস্থায়ী/ফেক ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করা যাবে না। অনুগ্রহ করে আসল ইমেইল ব্যবহার করুন।", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "সাইন আপ ব্যর্থ", description: error.message, variant: "destructive" });
    } else if (data.session) {
      toast({ title: "সাইন আপ সফল!", description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে।" });
      navigate("/");
    } else {
      toast({ title: "সাইন আপ সফল!", description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে। লগইন করুন।" });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">SAEM</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-muted-foreground mt-2">বিনামূল্যে রেজিস্ট্রেশন করুন এবং শুরু করুন।</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">পুরো নাম</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder="আপনার নাম" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="কমপক্ষে ৬ অক্ষর" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 font-semibold" disabled={loading}>
              {loading ? "সাইন আপ হচ্ছে..." : "সাইন আপ করুন"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">লগইন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
