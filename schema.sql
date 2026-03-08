-- ==========================================
-- RECANTO ORIENTAL DELIVERY DB SCHEMA
-- ==========================================

-- 1. Create custom ENUM for User Roles
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'courier');

-- 2. Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role DEFAULT 'customer'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Turn on Row Level Security (RLS) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Security Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'), 
    new.raw_user_meta_data->>'phone_number', 
    'customer'::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);


-- 4. Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);


-- 4.5 Product Complements
CREATE TABLE product_complement_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE product_complement_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Complement categories are viewable by everyone." ON product_complement_categories FOR SELECT USING (true);

CREATE TABLE product_complements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES product_complement_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE product_complements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Complements are viewable by everyone." ON product_complements FOR SELECT USING (true);


-- 5. Orders Table
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('online_stripe', 'cash', 'card_machine');

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id),
  courier_id UUID REFERENCES profiles(id), -- Null until a courier picks it up
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  payment_method payment_method NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders." 
ON orders FOR SELECT USING (auth.uid() = customer_id);

-- Admins and Couriers also need view policies here (simplified format for now)
-- Let's just allow read access based on auth
CREATE POLICY "Authenticated users can select orders." 
ON orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Customers can insert their own orders." 
ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);


-- 6. Order Items Table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  extras JSONB,
  comment TEXT
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view order items." 
ON order_items FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Customers can insert items to their own orders." 
ON order_items FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT customer_id FROM orders WHERE id = order_id)
);

-- ==========================================
-- REALTIME SETUP (Enable for Orders)
-- ==========================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
