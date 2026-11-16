-- =======================================================
-- CivicFix - Initial PostgreSQL Seed Data Script
-- =======================================================

-- 1. SEED DEPARTMENTS
INSERT INTO departments (id, name, code, description, contact_email, head_name, sla_hours) VALUES
(1, 'Solid Waste Management & Sanitation', 'SWM', 'Responsible for street sweeping, garbage collection, and dump clearance', 'sanitation@civicfix.org', 'Dr. Ramesh Kumar', 24),
(2, 'Roads, Potholes & Infrastructure', 'ROADS', 'Maintenance of city roads, footpaths, bridges, and asphalt repair', 'roads@civicfix.org', 'Er. Priya Sundaram', 48),
(3, 'Electricity & Street Lighting', 'ELEC', 'Streetlights, electrical junction boxes, and public illumination', 'electricity@civicfix.org', 'Er. Anil Mehta', 24),
(4, 'Water Supply & Sewerage Board', 'BWSSB', 'Drinking water pipelines, sewage lines, storm drains, and manholes', 'water@civicfix.org', 'Smt. Kavitha Reddy', 36),
(5, 'Public Amenities & Parks', 'PARKS', 'Public parks, bus shelters, public toilets, and playground maintenance', 'amenities@civicfix.org', 'Shri Rajesh Verma', 72)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for departments
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- 2. SEED USERS (Password for all accounts is 'Password123!' -> werkzeug scrypt hash)
INSERT INTO users (id, email, password_hash, full_name, phone, role, department_id, is_active) VALUES
(1, 'admin@civicfix.org', 'scrypt:32768:8:1$i8m7R709Lw3uRjV8$25ff6d03cf1c911cf81dcdeea1743a41ef7baeb02c38f9d0c6395b058fe8fe670b336338b39414da17e08285514f08e42f7c00eec2ce96cb95a315189eb86b77', 'CivicFix Administrator', '+91 98450 11223', 'admin', NULL, TRUE),
(2, 'staff@civicfix.org', 'scrypt:32768:8:1$i8m7R709Lw3uRjV8$25ff6d03cf1c911cf81dcdeea1743a41ef7baeb02c38f9d0c6395b058fe8fe670b336338b39414da17e08285514f08e42f7c00eec2ce96cb95a315189eb86b77', 'Kiran Sharma (Inspector)', '+91 98450 22334', 'staff', 1, TRUE),
(3, 'roads.staff@civicfix.org', 'scrypt:32768:8:1$i8m7R709Lw3uRjV8$25ff6d03cf1c911cf81dcdeea1743a41ef7baeb02c38f9d0c6395b058fe8fe670b336338b39414da17e08285514f08e42f7c00eec2ce96cb95a315189eb86b77', 'Deepak Gowda (Site Engineer)', '+91 98450 33445', 'staff', 2, TRUE),
(4, 'citizen@civicfix.org', 'scrypt:32768:8:1$i8m7R709Lw3uRjV8$25ff6d03cf1c911cf81dcdeea1743a41ef7baeb02c38f9d0c6395b058fe8fe670b336338b39414da17e08285514f08e42f7c00eec2ce96cb95a315189eb86b77', 'Arun Swaminathan', '+91 98450 44556', 'citizen', NULL, TRUE),
(5, 'sunita.citizen@civicfix.org', 'scrypt:32768:8:1$i8m7R709Lw3uRjV8$25ff6d03cf1c911cf81dcdeea1743a41ef7baeb02c38f9d0c6395b058fe8fe670b336338b39414da17e08285514f08e42f7c00eec2ce96cb95a315189eb86b77', 'Sunita Rao', '+91 98450 55667', 'citizen', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. SEED CATEGORIES
INSERT INTO categories (id, department_id, name, slug, description, default_priority, keywords, icon) VALUES
(1, 1, 'Garbage Overflow & Waste Dumping', 'garbage-overflow', 'Unattended piles of trash, overflowing public dumpsters, illegal dumping', 'High', 'garbage, waste, trash, dump, bin, filth, rotten, smell, odor, litter, plastic', 'trash-2'),
(2, 2, 'Potholes & Road Cavities', 'potholes-road-damage', 'Hazardous craters, peeled tarmac, depressions on roadways causing accidents', 'High', 'pothole, crater, road broken, asphalt, tar, ditch, bump, uneven surface, cave-in', 'navigation'),
(3, 3, 'Broken or Flickering Streetlights', 'broken-streetlights', 'Non-functional lamps, dark roads at night, dangling wire poles', 'Medium', 'streetlight, light, dark, lamp, flickering, pole, wire, darkness, bulb, tube', 'lightbulb'),
(4, 4, 'Drainage Overflow & Sewage Leak', 'drainage-sewage-leak', 'Blocked stormwater culverts, foul sewage on roads, open or broken manholes', 'Critical', 'drain, sewage, manhole, gutter, clogged, dirty water, leak, stench, flooded, overflow', 'droplets'),
(5, 4, 'Water Pipeline Burst & Contamination', 'water-pipeline-burst', 'Leaking potable water main lines, contaminated or discolored drinking water', 'High', 'water pipe, pipe burst, water supply, drinking water, muddy water, valve', 'waves'),
(6, 2, 'Damaged Footpath & Curbing', 'damaged-footpath', 'Broken walkway paver blocks, encroached sidewalk, uncovered storm slabs', 'Medium', 'footpath, pavement, sidewalk, curb, tiles, pedestrian, walkway, slab', 'footprints'),
(7, 5, 'Damaged Public Amenities & Parks', 'public-amenities-parks', 'Broken benches, playground swings vandalized, destroyed bus shelters', 'Low', 'park, bench, bus shelter, swing, garden, railing, public toilet, playground', 'tree-pine')
ON CONFLICT (id) DO NOTHING;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
