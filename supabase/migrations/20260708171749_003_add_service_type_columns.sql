/*
# Add Missing Columns to service_types

1. Changes
- Add category column (text) for grouping services (Land & Property, Corporate, etc.)
- Add requires_witness column (boolean) for legal requirements
- Add default_fee column (integer) in Rwandan Francs

2. Notes
- All columns are nullable to avoid breaking existing data
- These columns support MINIJUST reporting requirements
*/

ALTER TABLE service_types 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS requires_witness boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS default_fee integer;
