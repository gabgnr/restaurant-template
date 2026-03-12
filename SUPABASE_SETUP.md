# Configuration Supabase

## Table `orders`

Créez la table `orders` dans votre base de données Supabase avec la requête SQL suivante :

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  order_type TEXT CHECK (order_type IN ('delivery', 'takeaway')),
  delivery_address TEXT,
  items JSONB,
  total_amount INTEGER,
  stripe_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant sees own orders" ON orders
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (true);
```

## Colonne `online_order_enabled` sur `restaurants`

Ajoutez la colonne `online_order_enabled` à la table `restaurants` si elle n'existe pas déjà :

```sql
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS online_order_enabled BOOLEAN DEFAULT false;
```

Pour activer les commandes en ligne pour un restaurant :

```sql
UPDATE restaurants
SET online_order_enabled = true
WHERE slug = 'votre-slug-restaurant';
```
