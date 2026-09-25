-- Cloudflare D1 migration: direct book orders
-- Apply:  npx wrangler d1 execute navjot-orders --remote --file=schema.sql
-- Bind the database to the Pages project as "DB" (Settings → Bindings → D1 database).

CREATE TABLE IF NOT EXISTS orders (
  id          TEXT PRIMARY KEY,                               -- order ref shown to the buyer, e.g. NK-L8K2QZ7F1
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,                                  -- 10-digit Indian mobile
  email       TEXT NOT NULL,
  address     TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  qty         INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 50),
  amount      INTEGER NOT NULL CHECK (amount > 0),            -- INR, computed server-side
  utr         TEXT NOT NULL UNIQUE,                           -- UPI transaction reference
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'verified', 'shipped', 'cancelled', 'refunded'))
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);

-- Handy queries:
--   SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
--   UPDATE orders SET status = 'verified' WHERE id = 'NK-XXXXXXXXX';
