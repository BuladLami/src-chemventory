/* Supabase schema - run this in your Supabase SQL editor to create the chemicals table

CREATE TABLE public.chemicals (
  id text PRIMARY KEY,
  name text,
  batchNumber text,
  brand text,
  physicalState jsonb,
  initialQuantity integer,
  currentQuantity integer,
  arrivalDate date,
  expirationDate date,
  safetyClass text,
  location text,
  ghsSymbol text,
  dateAdded timestamptz
);

-- add created_at/updated_at to help with server-side timestamps
ALTER TABLE public.chemicals
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add other tables: equipment, users, logs as needed.
*/

/* Logs table and triggers for chemicals */
-- Create a generic logs table to capture audit events
CREATE TABLE IF NOT EXISTS public.logs (
  id bigserial PRIMARY KEY,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  data jsonb,
  actor jsonb,
  created_at timestamptz DEFAULT now()
);

-- Function to set updated_at on chemicals
CREATE OR REPLACE FUNCTION public.set_chemicals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    NEW.created_at = COALESCE(NEW.created_at, now());
    NEW.updated_at = COALESCE(NEW.updated_at, now());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to chemicals for insert/update
DROP TRIGGER IF EXISTS trg_set_updated_at ON public.chemicals;
CREATE TRIGGER trg_set_updated_at
BEFORE INSERT OR UPDATE ON public.chemicals
FOR EACH ROW EXECUTE FUNCTION public.set_chemicals_updated_at();

-- Function to log changes into public.logs
CREATE OR REPLACE FUNCTION public.log_chemicals_change()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    payload = to_jsonb(OLD);
    INSERT INTO public.logs(action, table_name, record_id, data) VALUES ('delete', TG_TABLE_NAME, OLD.id::text, payload);
    RETURN OLD;
  ELSE
    payload = to_jsonb(NEW);
    INSERT INTO public.logs(action, table_name, record_id, data) VALUES (LOWER(TG_OP), TG_TABLE_NAME, NEW.id::text, payload);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_changes ON public.chemicals;
CREATE TRIGGER trg_log_changes
AFTER INSERT OR UPDATE OR DELETE ON public.chemicals
FOR EACH ROW EXECUTE FUNCTION public.log_chemicals_change();
