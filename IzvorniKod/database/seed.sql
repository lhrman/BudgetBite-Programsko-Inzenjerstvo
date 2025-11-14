-- ==============================================
-- SEED PODACI ZA BAZU 
-- Uključen: OAuth2 (nema lozinki), AppUser/Student/Creator/Admin,
-- Allergens, Dietary Restrictions, Equipment, Ingredients, Recipes (15),
-- Media, Recipe_Ingredients, Recipe_Equipment, Student_Equipment,
-- MealPlan + Items, Food_Mood_Journal.
-- Isključeno: Rating, Challenge, Reflection, ForgotPassword.
-- ==============================================

-- 0) Korisnici (OAuth2: koristimo provider + provider_user_id)
INSERT INTO AppUser (name, email, auth_provider, role_chosen_at, provider_user_id) VALUES
('Marko Marković',   'marko@student.hr',        'google', NOW(), 'google-uid-001'),
('Ivana Horvat',     'ivana@student.hr',        'google', NOW(), 'google-uid-002'),
('Ana Marić',        'ana@student.hr',          'google', NOW(), 'google-uid-003'),
('Luka Creator',     'luka.creator@example.com','email',  NOW(), 'email-uid-004'),
('Maja Creator',     'maja.creator@example.com','email',  NOW(), 'email-uid-005'),
('Admin User',       'admin@example.com',       'email',  NOW(), 'email-uid-006');

-- 1) Uloge (subtypes)
-- Students
INSERT INTO Student (user_id, weekly_budget, goals)
SELECT user_id, 120.00, 'Više proteina, kuhanje kod kuće.'  FROM AppUser WHERE email='marko@student.hr';
INSERT INTO Student (user_id, weekly_budget, goals)
SELECT user_id, 100.00, 'Vegetarijanski izbori i niski troškovi.' FROM AppUser WHERE email='ivana@student.hr';
INSERT INTO Student (user_id, weekly_budget, goals)
SELECT user_id,  85.00, 'Manje šećera, brzi obroci.' FROM AppUser WHERE email='ana@student.hr';

-- Creators
INSERT INTO Creator (user_id) SELECT user_id FROM AppUser WHERE email='luka.creator@example.com';
INSERT INTO Creator (user_id) SELECT user_id FROM AppUser WHERE email='maja.creator@example.com';

-- Admin
INSERT INTO Admin (user_id)   SELECT user_id FROM AppUser WHERE email='admin@example.com';

-- 2) Allergens
INSERT INTO ALLERGEN (name) VALUES
('Gluten'),('Laktoza'),('Kikiriki'),('Jaja'),('Soja'),('Orašasti plodovi'),('Riba'),('Školjke');

-- Povezivanje studenata i alergena
INSERT INTO student_allergen (user_id, allergen_id)
SELECT s.user_id, a.allergen_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN ALLERGEN a ON a.name='Laktoza'
WHERE u.email='ivana@student.hr';

INSERT INTO student_allergen (user_id, allergen_id)
SELECT s.user_id, a.allergen_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN ALLERGEN a ON a.name='Kikiriki'
WHERE u.email='ana@student.hr';

-- 3) Dietary Restrictions
INSERT INTO DIETARY_RESTRICTION (name) VALUES
('Vegan'),('Vegetarian'),('Keto'),('Low Sugar'),('High Protein'),('Dairy Free');

-- Povezivanje studenata i restrikcija
INSERT INTO student_diet (user_id, restriction_id)
SELECT s.user_id, r.restriction_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN DIETARY_RESTRICTION r ON r.name='High Protein'
WHERE u.email='marko@student.hr';

INSERT INTO student_diet (user_id, restriction_id)
SELECT s.user_id, r.restriction_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN DIETARY_RESTRICTION r ON r.name='Vegetarian'
WHERE u.email='ivana@student.hr';

INSERT INTO student_diet (user_id, restriction_id)
SELECT s.user_id, r.restriction_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN DIETARY_RESTRICTION r ON r.name='Low Sugar'
WHERE u.email='ana@student.hr';

-- 4) Equipment (10+)
INSERT INTO EQUIPMENT (equipment_name) VALUES
('Blender'),('Tava'),('Lonac'),('Pećnica'),('Mikrovalna'),
('Roštilj tava'),('Air Fryer'),('Nož i daska'),('Cjedilo'),('Mikser');

-- Student equipment
INSERT INTO student_equipment (user_id, equipment_id)
SELECT s.user_id, e.equipment_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN EQUIPMENT e ON e.equipment_name IN ('Tava','Lonac','Nož i daska')
WHERE u.email='marko@student.hr';

INSERT INTO student_equipment (user_id, equipment_id)
SELECT s.user_id, e.equipment_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN EQUIPMENT e ON e.equipment_name IN ('Blender','Mikrovalna','Cjedilo')
WHERE u.email='ivana@student.hr';

INSERT INTO student_equipment (user_id, equipment_id)
SELECT s.user_id, e.equipment_id
FROM Student s
JOIN AppUser u ON u.user_id = s.user_id
JOIN EQUIPMENT e ON e.equipment_name IN ('Air Fryer','Pećnica','Roštilj tava')
WHERE u.email='ana@student.hr';

-- 5) Ingredients (20+)
INSERT INTO INGREDIENT (name, default_unit) VALUES
('Piletina', 'g'),
('Puretina', 'g'),
('Tofu', 'g'),
('Riža', 'g'),
('Tjestenina', 'g'),
('Kvinoa', 'g'),
('Tikvica', 'g'),
('Paprika', 'g'),
('Mrkva', 'g'),
('Luk', 'g'),
('Češnjak', 'g'),
('Brokula', 'g'),
('Špinat', 'g'),
('Rajčica', 'g'),
('Kukuruz', 'g'),
('Grah', 'g'),
('Jaje', 'kom'),
('Jogurt', 'ml'),
('Banana', 'kom'),
('Jagode', 'g'),
('Zobene pahuljice', 'g'),
('Mlijeko biljno', 'ml'),
('Maslinovo ulje', 'ml');

-- 6) Recipes (15) – autori su Luka i Maja (Creators)
-- Pomocne podupite za user_id kreatora
-- (koriste se u INSERT-ima)
-- RECIPE 1..15
INSERT INTO Recipe (recipe_name, description, prep_time_min, price_estimate, user_id, average_rating)
VALUES
('Piletina s povrćem', 'Brzo jelo s piletinom, tikvicom i mrkvom.', 25, 3.20,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.5),
('Vege rižoto', 'Rižoto s povrćem (bez mesa).', 30, 2.10,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='maja.creator@example.com')), 4.2),
('Smoothie od jagoda', 'Osvježavajući smoothie za doručak.', 5, 1.50,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.8),
('Kinoa sa špinatom', 'Topla salata od kvinoe i špinata.', 20, 2.80,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='maja.creator@example.com')), 4.1),
('Tjestenina s rajčicom', 'Jednostavna tjestenina s umakom od rajčice.', 18, 1.90,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.0),
('Tofu stir-fry', 'Tofu s povrćem pržen na tavi.', 15, 2.60,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='maja.creator@example.com')), 4.3),
('Piletina iz pećnice', 'Pečena piletina s povrćem.', 40, 3.80,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.4),
('Brokula i tjestenina', 'Kombinacija brokule i tjestenine.', 22, 2.00,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='maja.creator@example.com')), 4.0),
('Jaja s povrćem', 'Brzi obrok s jajima i povrćem.', 10, 1.20,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.2),
('Riža s grahom', 'Proteinski obrok s rižom i grahom.', 25, 1.70,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='maja.creator@example.com')), 4.1),
('Zobena kaša s bananom', 'Doručak s zobenim pahuljicama i bananom.', 7, 0.90,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.6),
('Špinat omlet', 'Omlet sa špinatom i lukom.', 8, 1.10,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='maja.creator@example.com')), 4.3),
('Kukuruzna salata', 'Lagani obrok s kukuruzom, grahom i rajčicom.', 12, 1.40,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.0),
('Pire od brokule', 'Kremasti pire od brokule.', 15, 1.30,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='maja.creator@example.com')), 3.9),
('Proteinski smoothie', 'Smoothie s jogurtom i zobenim pahuljicama.', 6, 1.20,
 (SELECT user_id FROM Creator WHERE user_id = (SELECT user_id FROM AppUser WHERE email='luka.creator@example.com')), 4.7);

-- 7) Recipe Media (jedna slika po receptu, demo URL-ovi)
INSERT INTO RECIPE_MEDIA (recipe_id, media_type, media_url)
SELECT recipe_id, 'image', 'https://example.com/img/' || replace(lower(recipe_name), ' ', '-') || '.jpg'
FROM Recipe;

-- 8) Recipe_Ingredients (koristimo subselectove po imenu recepta i sastojku)

-- Helper: funkcija za dohvate ID-a (komentarno, subselectove koristimo izravno u INSERT-u)
-- Primjeri u nastavku:

-- Piletina s povrćem
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina s povrćem'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Piletina'), 200),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina s povrćem'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Tikvica'), 120),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina s povrćem'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Mrkva'), 80),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina s povrćem'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Maslinovo ulje'), 10);

-- Vege rižoto
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Vege rižoto'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Riža'), 150),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Vege rižoto'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Luk'), 50),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Vege rižoto'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Tikvica'), 100),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Vege rižoto'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Paprika'), 80);

-- Smoothie od jagoda
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Smoothie od jagoda'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Jagode'), 180),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Smoothie od jagoda'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Mlijeko biljno'), 200),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Smoothie od jagoda'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Zobene pahuljice'), 40);

-- Kinoa sa špinatom
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Kinoa sa špinatom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Kvinoa'), 140),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Kinoa sa špinatom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Špinat'), 120),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Kinoa sa špinatom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Luk'), 40);

-- Tjestenina s rajčicom
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tjestenina s rajčicom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Tjestenina'), 160),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tjestenina s rajčicom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Rajčica'), 150),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tjestenina s rajčicom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Češnjak'), 10),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tjestenina s rajčicom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Maslinovo ulje'), 15);

-- Tofu stir-fry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tofu stir-fry'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Tofu'), 200),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tofu stir-fry'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Paprika'), 100),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tofu stir-fry'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Luk'), 50);

-- Piletina iz pećnice
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina iz pećnice'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Piletina'), 220),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina iz pećnice'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Mrkva'), 90),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina iz pećnice'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Tikvica'), 100),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina iz pećnice'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Maslinovo ulje'), 12);

-- Brokula i tjestenina
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Brokula i tjestenina'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Tjestenina'), 150),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Brokula i tjestenina'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Brokula'), 120),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Brokula i tjestenina'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Češnjak'), 8);

-- Jaja s povrćem
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Jaja s povrćem'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Jaje'), 2),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Jaja s povrćem'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Luk'), 30),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Jaja s povrćem'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Špinat'), 80);

-- Riža s grahom
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Riža s grahom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Riža'), 140),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Riža s grahom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Grah'), 120),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Riža s grahom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Luk'), 40);

-- Zobena kaša s bananom
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Zobena kaša s bananom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Zobene pahuljice'), 60),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Zobena kaša s bananom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Banana'), 1),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Zobena kaša s bananom'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Mlijeko biljno'), 200);

-- Špinat omlet
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Špinat omlet'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Jaje'), 2),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Špinat omlet'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Špinat'), 70),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Špinat omlet'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Luk'), 20);

-- Kukuruzna salata
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Kukuruzna salata'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Kukuruz'), 120),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Kukuruzna salata'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Grah'), 100),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Kukuruzna salata'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Rajčica'), 100);

-- Pire od brokule
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Pire od brokule'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Brokula'), 200),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Pire od brokule'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Jogurt'), 80);

-- Proteinski smoothie
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Proteinski smoothie'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Jogurt'), 200),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Proteinski smoothie'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Zobene pahuljice'), 50),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Proteinski smoothie'), (SELECT ingredient_id FROM INGREDIENT WHERE name='Banana'), 1);

-- 9) Recipe_Equipment veza
-- Mapiranje prema zahtjevnosti recepta
INSERT INTO recipe_equipment (recipe_id, equipment_id)
SELECT r.recipe_id, e.equipment_id FROM Recipe r
JOIN EQUIPMENT e ON e.equipment_name='Tava'
WHERE r.recipe_name IN ('Piletina s povrćem','Tofu stir-fry','Brokula i tjestenina');

INSERT INTO recipe_equipment (recipe_id, equipment_id)
SELECT r.recipe_id, e.equipment_id FROM Recipe r
JOIN EQUIPMENT e ON e.equipment_name='Lonac'
WHERE r.recipe_name IN ('Vege rižoto','Riža s grahom','Kinoa sa špinatom');

INSERT INTO recipe_equipment (recipe_id, equipment_id)
SELECT r.recipe_id, e.equipment_id FROM Recipe r
JOIN EQUIPMENT e ON e.equipment_name='Blender'
WHERE r.recipe_name IN ('Smoothie od jagoda','Proteinski smoothie');

INSERT INTO recipe_equipment (recipe_id, equipment_id)
SELECT r.recipe_id, e.equipment_id FROM Recipe r
JOIN EQUIPMENT e ON e.equipment_name='Pećnica'
WHERE r.recipe_name IN ('Piletina iz pećnice');

INSERT INTO recipe_equipment (recipe_id, equipment_id)
SELECT r.recipe_id, e.equipment_id FROM Recipe r
JOIN EQUIPMENT e ON e.equipment_name='Mikrovalna'
WHERE r.recipe_name IN ('Zobena kaša s bananom');

-- 10) Recipe Restrictions (primjeri)
INSERT INTO recipe_restriction (recipe_id, restriction_id)
SELECT (SELECT recipe_id FROM Recipe WHERE recipe_name='Vege rižoto'),
       (SELECT restriction_id FROM DIETARY_RESTRICTION WHERE name='Vegetarian');

INSERT INTO recipe_restriction (recipe_id, restriction_id)
SELECT (SELECT recipe_id FROM Recipe WHERE recipe_name='Tofu stir-fry'),
       (SELECT restriction_id FROM DIETARY_RESTRICTION WHERE name='Vegan');

INSERT INTO recipe_restriction (recipe_id, restriction_id)
SELECT (SELECT recipe_id FROM Recipe WHERE recipe_name='Proteinski smoothie'),
       (SELECT restriction_id FROM DIETARY_RESTRICTION WHERE name='High Protein');

INSERT INTO recipe_restriction (recipe_id, restriction_id)
SELECT (SELECT recipe_id FROM Recipe WHERE recipe_name='Smoothie od jagoda'),
       (SELECT restriction_id FROM DIETARY_RESTRICTION WHERE name='Low Sugar');

-- 11) MEALPLAN (jedan tjedan) + dodjela studentima + stavke
INSERT INTO MEALPLAN (week_start, week_end, total_cost)
VALUES ('2025-11-10', '2025-11-16', 29.90);

-- Povezivanje s Markom i Ivanom
INSERT INTO student_mealplan (user_id, week_start)
SELECT s.user_id, '2025-11-10'::date
FROM Student s JOIN AppUser u ON u.user_id = s.user_id
WHERE u.email IN ('marko@student.hr','ivana@student.hr');

-- Stavke plana (pon-sri)
INSERT INTO mealplan_items (recipe_id, week_start, day_of_week, meal_slot) VALUES
((SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina s povrćem'), '2025-11-10', 'Monday', 'Lunch'),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Vege rižoto'),         '2025-11-10', 'Tuesday', 'Dinner'),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Smoothie od jagoda'),  '2025-11-10', 'Wednesday', 'Breakfast'),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Tjestenina s rajčicom'), '2025-11-10', 'Thursday', 'Dinner'),
((SELECT recipe_id FROM Recipe WHERE recipe_name='Proteinski smoothie'), '2025-11-10', 'Friday', 'Breakfast');

-- 12) FOOD_MOOD_JOURNAL (unos za Marka i Ivanu)
INSERT INTO FOOD_MOOD_JOURNAL (consumed_at, user_id, recipe_id, mood_before, mood_after, notes)
SELECT NOW(), s.user_id, (SELECT recipe_id FROM Recipe WHERE recipe_name='Piletina s povrćem'), 3, 4, 'Bolje raspoloženje nakon ručka.'
FROM Student s JOIN AppUser u ON u.user_id = s.user_id
WHERE u.email='marko@student.hr';

INSERT INTO FOOD_MOOD_JOURNAL (consumed_at, user_id, recipe_id, mood_before, mood_after, notes)
SELECT NOW(), s.user_id, (SELECT recipe_id FROM Recipe WHERE recipe_name='Vege rižoto'), 2, 4, 'Lagano i zasitno.'
FROM Student s JOIN AppUser u ON u.user_id = s.user_id
WHERE u.email='ivana@student.hr';
