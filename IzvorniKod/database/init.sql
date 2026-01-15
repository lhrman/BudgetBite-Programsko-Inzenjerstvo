-- ============================================================
-- INIT.SQL – baza u potpunosti prema opisu (AUTOMATIC IDs)
-- ============================================================

-- =========================
--  APPUSER (supertype)
-- =========================
CREATE TABLE AppUser (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL CHECK (email LIKE '%@%.%'),
    auth_provider VARCHAR(50) NOT NULL,
    role_chosen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    provider_user_id VARCHAR(255) NOT NULL
); 

-- ============================================================
--  SUBTYPES (Student, Creator, Admin)
--  Primarni ključ = strani ključ (nasljeđivanje)
-- ============================================================

CREATE TABLE Student (
    user_id INT PRIMARY KEY REFERENCES AppUser(user_id) ON DELETE CASCADE,
    weekly_budget DECIMAL(10,2),
    goals TEXT
);

CREATE TABLE Creator (
    user_id INT PRIMARY KEY REFERENCES AppUser(user_id) ON DELETE CASCADE
);

CREATE TABLE Admin (
    user_id INT PRIMARY KEY REFERENCES AppUser(user_id) ON DELETE CASCADE
);

-- =========================
--  ALLERGEN
-- =========================
CREATE TABLE ALLERGEN (
    allergen_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- =========================
--  student_allergen (M:N)
-- =========================
CREATE TABLE student_allergen (
    user_id INT REFERENCES Student(user_id) ON DELETE CASCADE,
    allergen_id INT REFERENCES ALLERGEN(allergen_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, allergen_id)
);

-- =========================
-- DIETARY_RESTRICTION
-- =========================
CREATE TABLE DIETARY_RESTRICTION (
    restriction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- =========================
-- student_diet (M:N)
-- =========================
CREATE TABLE student_diet (
    user_id INT REFERENCES Student(user_id) ON DELETE CASCADE,
    restriction_id INT REFERENCES DIETARY_RESTRICTION(restriction_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, restriction_id)
);

-- =========================
--  RECIPE
-- =========================
CREATE TABLE Recipe (
    recipe_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipe_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    average_rating DECIMAL(2,1),
    prep_time_min INT,
    price_estimate DECIMAL(10,2),
    user_id INT REFERENCES Creator(user_id) ON DELETE SET NULL
);

-- =========================
-- RECIPE_RESTRICTION (M:N)
-- =========================
CREATE TABLE recipe_restriction (
    recipe_id INT REFERENCES Recipe(recipe_id) ON DELETE CASCADE,
    restriction_id INT REFERENCES DIETARY_RESTRICTION(restriction_id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, restriction_id)
);

-- =========================
-- RECIPE_MEDIA (1:N)
-- =========================
CREATE TABLE RECIPE_MEDIA (
    media_id INT GENERATED ALWAYS AS IDENTITY,
    recipe_id INT REFERENCES Recipe(recipe_id) ON DELETE CASCADE,
    media_type VARCHAR(50),
    media_url VARCHAR(255),
    PRIMARY KEY (media_id, recipe_id)
);

-- =========================
-- EQUIPMENT
-- =========================
CREATE TABLE EQUIPMENT (
    equipment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    equipment_name VARCHAR(255)
);

-- =========================
-- INGREDIENT
-- =========================
CREATE TABLE INGREDIENT (
    ingredient_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255),
    default_unit VARCHAR(50)
);

-- =========================
-- recipe_ingredients (M:N)
-- =========================
CREATE TABLE recipe_ingredients (
    recipe_id INT REFERENCES Recipe(recipe_id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES INGREDIENT(ingredient_id) ON DELETE CASCADE,
    quantity DECIMAL(10,2),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- =========================
-- recipe_equipment (M:N)
-- =========================
CREATE TABLE recipe_equipment (
    recipe_id INT REFERENCES Recipe(recipe_id) ON DELETE CASCADE,
    equipment_id INT REFERENCES EQUIPMENT(equipment_id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, equipment_id)
);

-- =========================
-- student_equipment (M:N)
-- =========================
CREATE TABLE student_equipment (
    user_id INT REFERENCES Student(user_id) ON DELETE CASCADE,
    equipment_id INT REFERENCES EQUIPMENT(equipment_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, equipment_id)
);

-- =========================
-- MEALPLAN
-- =========================
CREATE TABLE MEALPLAN (
    week_start DATE PRIMARY KEY,
    week_end DATE NOT NULL,
    total_cost DECIMAL(10,2)
);

-- =========================
-- student_mealplan (M:N)
-- =========================
CREATE TABLE student_mealplan (
    user_id INT REFERENCES Student(user_id) ON DELETE CASCADE,
    week_start DATE REFERENCES MEALPLAN(week_start) ON DELETE CASCADE,
    PRIMARY KEY (user_id, week_start)
);

-- =========================
-- MEALPLAN_ITEMS (M:N)
-- =========================
CREATE TABLE mealplan_items (
    recipe_id INT REFERENCES Recipe(recipe_id) ON DELETE CASCADE,
    week_start DATE REFERENCES MEALPLAN(week_start) ON DELETE CASCADE,
    day_of_week VARCHAR(20),
    meal_slot VARCHAR(50),
    PRIMARY KEY (recipe_id, week_start)
);

-- =========================
-- FOOD_MOOD_JOURNAL
-- =========================
CREATE TABLE FOOD_MOOD_JOURNAL (
    consumed_at TIMESTAMP,
    recipe_id INT REFERENCES Recipe(recipe_id) ON DELETE CASCADE,
    user_id INT REFERENCES Student(user_id) ON DELETE CASCADE,
    mood_before INT CHECK (mood_before BETWEEN 1 AND 5),
    mood_after INT CHECK (mood_after BETWEEN 1 AND 5),
    notes TEXT,
    PRIMARY KEY (consumed_at, recipe_id, user_id)
);

-- =========================
-- REFLECTION (1:1)
-- =========================
CREATE TABLE REFLECTION (
    user_id INT PRIMARY KEY REFERENCES Student(user_id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    total_spent DECIMAL(10,2),
    home_cooked_meals INT,
    summary_text TEXT
);

-- =========================
-- RATING
-- =========================
CREATE TABLE Rating (
    rated_at TIMESTAMP PRIMARY KEY,
    user_id INT REFERENCES Student(user_id) ON DELETE CASCADE,
    recipe_id INT REFERENCES Recipe(recipe_id) ON DELETE CASCADE,
    score INT CHECK (score BETWEEN 1 AND 5),
    UNIQUE (user_id, recipe_id)
);

-- =========================
-- CHALLENGE
-- =========================
CREATE TABLE CHALLENGE (
    challenge_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    description VARCHAR(255)
);

-- =========================
-- student_challenge (M:N)
-- =========================
CREATE TABLE student_challenge (
    user_id INT REFERENCES Student(user_id) ON DELETE CASCADE,
    challenge_id INT REFERENCES CHALLENGE(challenge_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, challenge_id)
<<<<<<< HEAD
=======
);

-- =========================
-- ForgotPassword
-- =========================
CREATE TABLE ForgotPassword (
    fpid INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES AppUser(user_id) ON DELETE CASCADE,
    kod_za_promjenu VARCHAR(255),
    kod_verified BOOLEAN,
    expirdate TIMESTAMP
>>>>>>> 1a8eea0af8837afa598d3dceb47bb1a790998ea2
);

