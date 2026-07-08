/*
# Seed Reference Data for DONE Notary Platform

1. Service Types
- Standardized Rwandan notary services (Article 46 compliant)
- Includes Kinyarwanda translations for citizen-facing forms
- Categories: Land & Property, Corporate, Personal Documents, Family

2. Rwanda Locations
- Complete administrative hierarchy: Province → District → Sector
- Based on official Rwandan administrative divisions
- Used for MINIJUST compliance reporting

3. Notes
- Service types are globally shared across organizations
- Locations are globally shared across organizations
- Both tables support multilingual labels (English + Kinyarwanda)
*/

-- Seed Service Types (Rwandan Notary Services)
INSERT INTO service_types (id, name, name_kinyarwanda, code, category, description, requires_witness, default_fee, is_active, sort_order) VALUES
-- Land & Property
('550e8400-e29b-41d4-a716-446655440001', 'Land Transfer', 'Kwandikanya Umutungo', 'LAND-001', 'Land & Property', 'Transfer of land ownership and title registration', true, 50000, true, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Property Sale Agreement', 'Amanani yo Gutunganya', 'PROP-001', 'Land & Property', 'Sale and purchase agreements for immovable property', true, 40000, true, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Mortgage Registration', 'Kwandika inguzanyo', 'MORT-001', 'Land & Property', 'Registration of mortgage on property', true, 35000, true, 3),

-- Corporate Documents
('550e8400-e29b-41d4-a716-446655440010', 'Power of Attorney', 'Ububasha', 'POA-001', 'Corporate', 'General and special power of attorney documents', false, 25000, true, 10),
('550e8400-e29b-41d4-a716-446655440011', 'Company Board Resolution', 'Icyemezo cya Komite', 'BRD-001', 'Corporate', 'Board resolutions and corporate decisions', false, 30000, true, 11),
('550e8400-e29b-41d4-a716-446655440012', 'Authentication of Contract', 'Kemeza Amasezerano', 'AUTH-001', 'Corporate', 'Authentication and notarization of business contracts', false, 35000, true, 12),
('550e8400-e29b-41d4-a716-446655440013', 'Company Incorporation Documents', 'Inyandiko zo Gutangiza Isosiyeti', 'INC-001', 'Corporate', 'Articles of incorporation and company registration', false, 60000, true, 13),

-- Personal Documents
('550e8400-e29b-41d4-a716-446655440020', 'Affidavit', 'Ibisobanuro', 'AFF-001', 'Personal Documents', 'Sworn statements and declarations', false, 15000, true, 20),
('550e8400-e29b-41d4-a716-446655440021', 'Certified Copy', 'Kopi Yemewe', 'CERT-001', 'Personal Documents', 'Certified true copies of original documents', false, 5000, true, 21),
('550e8400-e29b-41d4-a716-446655440022', 'Declaration of Heirship', 'Kwemeza Uwo Abungikijwe', 'HEIR-001', 'Personal Documents', 'Legal declaration of inheritance rights', true, 25000, true, 22),
('550e8400-e29b-41d4-a716-446655440023', 'Name Change Deed', 'Kuvugurura Izina', 'NAME-001', 'Personal Documents', 'Legal deed for name change', false, 20000, true, 23),

-- Family Documents
('550e8400-e29b-41d4-a716-446655440030', 'Marriage Certificate Authentication', 'Kwemeza Impapuro zubana', 'MARR-001', 'Family', 'Authentication of marriage certificates', false, 10000, true, 30),
('550e8400-e29b-41d4-a716-446655440031', 'Divorce Agreement', 'Amasezerano yo Gutandukana', 'DIV-001', 'Family', 'Notarized divorce settlement agreements', true, 40000, true, 31),
('550e8400-e29b-41d4-a716-446655440032', 'Child Guardianship', 'Kwita ku mwana', 'GUARD-001', 'Family', 'Legal guardianship documents for minors', true, 30000, true, 32)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_kinyarwanda = EXCLUDED.name_kinyarwanda,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  requires_witness = EXCLUDED.requires_witness,
  default_fee = EXCLUDED.default_fee,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Seed Rwanda Locations (Province → District → Sector)
INSERT INTO rwanda_locations (id, province, district, sector) VALUES
-- City of Kigali
('660e8400-e29b-41d4-a716-446655440001', 'City of Kigali', 'Nyarugenge', 'Nyarugenge'),
('660e8400-e29b-41d4-a716-446655440002', 'City of Kigali', 'Nyarugenge', 'Gitega'),
('660e8400-e29b-41d4-a716-446655440003', 'City of Kigali', 'Nyarugenge', 'Kacyiru'),
('660e8400-e29b-41d4-a716-446655440004', 'City of Kigali', 'Nyarugenge', 'Muhima'),
('660e8400-e29b-41d4-a716-446655440005', 'City of Kigali', 'Nyarugenge', 'Rwezamenyo'),
('660e8400-e29b-41d4-a716-446655440010', 'City of Kigali', 'Gasabo', 'Remera'),
('660e8400-e29b-41d4-a716-446655440011', 'City of Kigali', 'Gasabo', 'Kibagabaga'),
('660e8400-e29b-41d4-a716-446655440012', 'City of Kigali', 'Gasabo', 'Ndera'),
('660e8400-e29b-41d4-a716-446655440013', 'City of Kigali', 'Gasabo', 'Gikeni'),
('660e8400-e29b-41d4-a716-446655440020', 'City of Kigali', 'Kicukiro', 'Kicukiro'),
('660e8400-e29b-41d4-a716-446655440021', 'City of Kigali', 'Kicukiro', 'Kanombe'),
('660e8400-e29b-41d4-a716-446655440022', 'City of Kigali', 'Kicukiro', 'Nyarugunga'),
('660e8400-e29b-41d4-a716-446655440023', 'City of Kigali', 'Kicukiro', 'Gatenga'),

-- Northern Province
('660e8400-e29b-41d4-a716-446655440100', 'Northern Province', 'Musanze', 'Musanze'),
('660e8400-e29b-41d4-a716-446655440101', 'Northern Province', 'Musanze', 'Muhoza'),
('660e8400-e29b-41d4-a716-446655440102', 'Northern Province', 'Musanze', 'Cyuve'),
('660e8400-e29b-41d4-a716-446655440110', 'Northern Province', 'Gakenke', 'Gakenke'),
('660e8400-e29b-41d4-a716-446655440111', 'Northern Province', 'Gakenke', 'Musanze'),
('660e8400-e29b-41d4-a716-446655440120', 'Northern Province', 'Rulindo', 'Rulindo'),
('660e8400-e29b-41d4-a716-446655440121', 'Northern Province', 'Rulindo', 'Burega'),
('660e8400-e29b-41d4-a716-446655440130', 'Northern Province', 'Burera', 'Cyanika'),
('660e8400-e29b-41d4-a716-446655440131', 'Northern Province', 'Burera', 'Gahunga'),

-- Southern Province
('660e8400-e29b-41d4-a716-446655440200', 'Southern Province', 'Nyanza', 'Nyanza'),
('660e8400-e29b-41d4-a716-446655440201', 'Southern Province', 'Nyanza', 'Busasamana'),
('660e8400-e29b-41d4-a716-446655440210', 'Southern Province', 'Huye', 'Simbi'),
('660e8400-e29b-41d4-a716-446655440211', 'Southern Province', 'Huye', 'Tumba'),
('660e8400-e29b-41d4-a716-446655440220', 'Southern Province', 'Nyamagabe', 'Nyamagabe'),
('660e8400-e29b-41d4-a716-446655440221', 'Southern Province', 'Nyamagabe', 'Kaduha'),
('660e8400-e29b-41d4-a716-446655440230', 'Southern Province', 'Gisagara', 'Gisagara'),
('660e8400-e29b-41d4-a716-446655440231', 'Southern Province', 'Gisagara', 'Save'),

-- Eastern Province
('660e8400-e29b-41d4-a716-446655440300', 'Eastern Province', 'Rwamagana', 'Rwamagana'),
('660e8400-e29b-41d4-a716-446655440301', 'Eastern Province', 'Rwamagana', 'Musha'),
('660e8400-e29b-41d4-a716-446655440310', 'Eastern Province', 'Kayonza', 'Kayonza'),
('660e8400-e29b-41d4-a716-446655440311', 'Eastern Province', 'Kayonza', 'Mukarange'),
('660e8400-e29b-41d4-a716-446655440320', 'Eastern Province', 'Nyagatare', 'Nyagatare'),
('660e8400-e29b-41d4-a716-446655440321', 'Eastern Province', 'Nyagatare', 'Kiyombe'),
('660e8400-e29b-41d4-a716-446655440330', 'Eastern Province', 'Kirehe', 'Kirehe'),
('660e8400-e29b-41d4-a716-446655440331', 'Eastern Province', 'Kirehe', 'Mahama'),

-- Western Province
('660e8400-e29b-41d4-a716-446655440400', 'Western Province', 'Rubavu', 'Gisenyi'),
('660e8400-e29b-41d4-a716-446655440401', 'Western Province', 'Rubavu', 'Bugeshi'),
('660e8400-e29b-41d4-a716-446655440410', 'Western Province', 'Rusizi', 'Rusizi'),
('660e8400-e29b-41d4-a716-446655440411', 'Western Province', 'Rusizi', 'Bugarama'),
('660e8400-e29b-41d4-a716-446655440420', 'Western Province', 'Karongi', 'Karongi'),
('660e8400-e29b-41d4-a716-446655440421', 'Western Province', 'Karongi', 'Gishyita'),
('660e8400-e29b-41d4-a716-446655440430', 'Western Province', 'Rutsiro', 'Rutsiro'),
('660e8400-e29b-41d4-a716-446655440431', 'Western Province', 'Rutsiro', 'Boneza')

ON CONFLICT (id) DO UPDATE SET
  province = EXCLUDED.province,
  district = EXCLUDED.district,
  sector = EXCLUDED.sector;
