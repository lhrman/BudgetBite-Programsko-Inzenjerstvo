CREATE TABLE USER (
  user_id INT PRIMARY KEY,
  email VARCHAR(255) NOT NULL CHECK (email LIKE '_%@_%._%'),
  auth_provider VARCHAR NOT NULL,
  role_chosen_at TIMESTAMP NOT NULL,
  provider_user_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  
);

CREATE TABLE Student
(
  weekley_budget DECIMAL(8, 2) NOT NULL, 
  goals VARCHAR NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE Admin
(
  user_id INT NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE Creator
(
  user_id INT NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES USER(user_id)
);


CREATE TABLE ALLERGEN
(
  name VARCHAR NOT NULL,
  allergen_id INT NOT NULL,
  PRIMARY KEY (allergen_id)
);

CREATE TABLE DIETARY_RESTRICTION
(
  name VARCHAR NOT NULL, 
  restriction_id INT NOT NULL,
  PRIMARY KEY (restriction_id)
);

CREATE TABLE student_allergen
(
  user_id INT NOT NULL,
  allergen_id INT NOT NULL,
  PRIMARY KEY (user_id, allergen_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  FOREIGN KEY (allergen_id) REFERENCES ALLERGEN(allergen_id)
);

CREATE TABLE student_diet
(
  user_id INT NOT NULL,
  restriction_id INT NOT NULL,
  PRIMARY KEY (user_id, restriction_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  FOREIGN KEY (restriction_id) REFERENCES DIETARY_RESTRICTION(restriction_id)
);


CREATE TABLE Recipe
(
  created_at TIMESTAMP NOT NULL,
  average_rating DECIMAL(2, 1) NOT NULL,
  recipe_id INT NOT NULL,
  recipe_name VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  prep_time_min INT NOT NULL, 
  price_estimate DECIMAL(8, 2) NOT NULL, 
  user_id INT NOT NULL,
  PRIMARY KEY (recipe_id),
  FOREIGN KEY (user_id) REFERENCES Creator(user_id)
);

CREATE TABLE EQUIPMENT
(
  equipment_id INT NOT NULL,
  equipment_name VARCHAR NOT NULL,
  PRIMARY KEY (equipment_id)
);

CREATE TABLE RECIPE_MEDIA
(
  caption VARCHAR NOT NULL,
  media_id INT NOT NULL,
  media_type VARCHAR NOT NULL,
  media_url VARCHAR NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (media_id, recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

CREATE TABLE INGREDIENT
(
  ingredient_id INT NOT NULL,
  name VARCHAR NOT NULL,
  default_unit VARCHAR NOT NULL,
  PRIMARY KEY (ingredient_id)
);


CREATE TABLE recipe_ingredients
(
  quantity DECIMAL(6, 2) NOT NULL,
  recipe_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  PRIMARY KEY (recipe_id, ingredient_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  FOREIGN KEY (ingredient_id) REFERENCES INGREDIENT(ingredient_id)
);

CREATE TABLE recipe_equipment
(
  equipment_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (equipment_id, recipe_id),
  FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

CREATE TABLE recipe_allergen ( 
  recipe_id INT NOT NULL,
  allergen_id INT NOT NULL,
  PRIMARY KEY (recipe_id, allergen_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  FOREIGN KEY (allergen_id) REFERENCES ALLERGEN(allergen_id)
);

CREATE TABLE recipe_restriction ( 
  recipe_id INT NOT NULL,
  restriction_id INT NOT NULL,
  PRIMARY KEY (recipe_id, restriction_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  FOREIGN KEY (restriction_id) REFERENCES DIETARY_RESTRICTION(restriction_id)
);


CREATE TABLE MEALPLAN
(
  total_cost DECIMAL(8, 2) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  PRIMARY KEY (week_start)
);

CREATE TABLE student_mealplan
(
  user_id INT NOT NULL,
  week_start DATE NOT NULL,
  PRIMARY KEY (user_id, week_start),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  FOREIGN KEY (week_start) REFERENCES MEALPLAN(week_start)
);

CREATE TABLE mealplan_items
(
  day_of_week INT NOT NULL,
  meal_slot VARCHAR NOT NULL, -- npr. 'Doručak', 'Ručak', 'Večera'
  recipe_id INT NOT NULL,
  week_start DATE NOT NULL,
  PRIMARY KEY (recipe_id, week_start, day_of_week, meal_slot), -- Proširenje PK
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  FOREIGN KEY (week_start) REFERENCES MEALPLAN(week_start)
);

CREATE TABLE SHOPPING_LIST (
    
    list_id INT NOT NULL PRIMARY KEY,
    week_start DATE NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (week_start) REFERENCES MEALPLAN(week_start)
);

CREATE TABLE shopping_list_item (
    list_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    required_quantity DECIMAL(8, 2) NOT NULL, -- Ukupna količina za taj tjedan
    unit VARCHAR NOT NULL,
    is_purchased BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (list_id, ingredient_id),
    FOREIGN KEY (list_id) REFERENCES SHOPPING_LIST(list_id),
    FOREIGN KEY (ingredient_id) REFERENCES INGREDIENT(ingredient_id)
);

CREATE TABLE REFLECTION
(
  total_spent DECIMAL(8, 2) NOT NULL, 
  summary_text VARCHAR NOT NULL,
  week_start DATE NOT NULL,
  home_cooked_meals INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (user_id, week_start),
  FOREIGN KEY (user_id) REFERENCES Student(user_id)
);

CREATE TABLE FOOD_MOOD_JOURNAL ( -- Dnevnik raspoloženja 
    journal_entry_id INT NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    mood_before INT CHECK (mood_before BETWEEN 1 AND 5) NOT NULL,
    mood_after INT CHECK (mood_after BETWEEN 1 AND 5) NOT NULL, 
    meal_type VARCHAR, -- npr. 'Doručak', 'Ručak'
    notes VARCHAR,
    FOREIGN KEY (user_id) REFERENCES Student(user_id)
);

CREATE TABLE CHALLENGE
(
  title VARCHAR NOT NULL,
  reward_points INT NOT NULL,
  challenge_id INT NOT NULL,
  description VARCHAR NOT NULL,
  PRIMARY KEY (challenge_id)
);

CREATE TABLE student_challenge
(
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (challenge_id, user_id),
  FOREIGN KEY (challenge_id) REFERENCES CHALLENGE(challenge_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id)
);

CREATE TABLE Rating
(
  score INT NOT NULL,
  rated_at TIMESTAMP NOT NULL,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

CREATE TABLE student_equipment
(
  user_id INT NOT NULL,
  equipment_id INT NOT NULL,
  PRIMARY KEY (user_id, equipment_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id)
);