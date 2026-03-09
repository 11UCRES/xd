
-- Create listing category enum
CREATE TYPE public.listing_category AS ENUM ('facebook_page', 'youtube_channel', 'instagram', 'gaming_id');

-- Create listing status enum
CREATE TYPE public.listing_status AS ENUM ('active', 'sold', 'pending', 'removed');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('bkash', 'nagad', 'rocket', 'usdt', 'trx');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'payment_submitted', 'payment_confirmed', 'delivering', 'delivered', 'completed', 'disputed', 'refunded', 'cancelled');

-- Listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category listing_category NOT NULL,
  platform_url TEXT,
  followers_count TEXT,
  account_age TEXT,
  price NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BDT',
  status listing_status NOT NULL DEFAULT 'active',
  verified BOOLEAN NOT NULL DEFAULT false,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table (escrow system)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_reference TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  buyer_confirmed BOOLEAN NOT NULL DEFAULT false,
  seller_confirmed BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Listings RLS: anyone can read active listings
CREATE POLICY "Anyone can view active listings" ON public.listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Sellers can insert their own listings
CREATE POLICY "Sellers can create listings" ON public.listings
  FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());

-- Sellers can update their own listings
CREATE POLICY "Sellers can update own listings" ON public.listings
  FOR UPDATE TO authenticated USING (seller_id = auth.uid());

-- Orders RLS: buyer and seller can view their orders
CREATE POLICY "Users can view their orders" ON public.orders
  FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Buyers can create orders
CREATE POLICY "Buyers can create orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

-- Buyers and sellers can update their orders (confirm delivery etc)
CREATE POLICY "Users can update their orders" ON public.orders
  FOR UPDATE TO authenticated USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Anyone can submit contact messages
CREATE POLICY "Anyone can submit contact" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Update trigger for listings
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
