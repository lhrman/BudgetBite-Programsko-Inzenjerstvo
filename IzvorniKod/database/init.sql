CREATE TABLE CHALLENGE
(
  challenge_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (challenge_id)
);

CREATE TABLE AppUser
(
  user_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  auth_provider VARCHAR(50) NOT NULL,
  role_chosen_at TIMESTAMP NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT email_format CHECK (email LIKE '%@%._%')
);

CREATE TABLE Student
(
  weekley_budget DECIMAL(10, 2) NOT NULL,
  goals TEXT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES AppUser(user_id)
);

CREATE TABLE Admin
(
  user_id INT NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES AppUser(user_id)
);

CREATE TABLE Creator
(
  user_id INT NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES AppUser(user_id)
);

CREATE TABLE REFLECTION
(
  total_spent DECIMAL(10, 2) NOT NULL,
  summary_text TEXT NOT NULL,
  week_start DATE NOT NULL,
  home_cooked_meals INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id)
);

CREATE TABLE Recipe
(
  created_at TIMESTAMP NOT NULL,
  average_rating DECIMAL(2, 1) NOT NULL,
  recipe_id INT NOT NULL,
  recipe_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  prep_time_min INT NOT NULL,
  price_estimate DECIMAL(10, 2) NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (recipe_id),
  FOREIGN KEY (user_id) REFERENCES Creator(user_id)
);

CREATE TABLE EQUIPMENT
(
  equipment_id INT NOT NULL,
  equipment_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (equipment_id)
);

CREATE TABLE RECIPE_MEDIA
(
  media_id INT NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  media_url VARCHAR(255) NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (media_id, recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

CREATE TABLE INGREDIENT
(
  ingredient_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  default_unit VARCHAR(50) NOT NULL,
  PRIMARY KEY (ingredient_id)
);

CREATE TABLE MEALPLAN
(
  total_cost DECIMAL(10, 2) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  PRIMARY KEY (week_start)
);

CREATE TABLE ALLERGEN
(
  name VARCHAR(255) NOT NULL,
  allergen_id INT NOT NULL,
  PRIMARY KEY (allergen_id)
);

CREATE TABLE DIETARY_RESTRICTION
(
  name VARCHAR(255) NOT NULL,
  restriction_id INT NOT NULL,
  PRIMARY KEY (restriction_id)
);

CREATE TABLE ForgotPassword
(
  expirdate TIMESTAMP NOT NULL,
  fpid INT NOT NULL,
  kod_za_promjenu VARCHAR(255) NOT NULL,
  kod_verified BOOLEAN NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES AppUser(user_id)
);

CREATE TABLE FOOD_MOOD_JOURNAL
(
  consumed_at TIMESTAMP NOT NULL,
  mood_before INT NOT NULL,
  mood_after INT NOT NULL,
  notes TEXT,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (consumed_at, recipe_id, user_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  UNIQUE (recipe_id, user_id),
  CONSTRAINT mood_before_range CHECK (mood_before BETWEEN 1 AND 5),
  CONSTRAINT mood_after_range CHECK (mood_after BETWEEN 1 AND 5)
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
  PRIMARY KEY (rated_at),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  UNIQUE (user_id, recipe_id)
);

CREATE TABLE student_equipment
(
  user_id INT NOT NULL,
  equipment_id INT NOT NULL,
  PRIMARY KEY (user_id, equipment_id),
  FOREIGN KEY (user_id) REFERENCES Student(user_id),
  FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id)
);

CREATE TABLE recipe_equipment
(
  equipment_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (equipment_id, recipe_id),
  FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
);

CREATE TABLE recipe_ingredients
(
  quantity DECIMAL(10, 2) NOT NULL,
  recipe_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  PRIMARY KEY (recipe_id, ingredient_id),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  FOREIGN KEY (ingredient_id) REFERENCES INGREDIENT(ingredient_id)
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
  day_of_week VARCHAR(20) NOT NULL,
  meal_slot VARCHAR(50) NOT NULL,
  recipe_id INT NOT NULL,
  week_start DATE NOT NULL,
  PRIMARY KEY (recipe_id, week_start),
  FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
  FOREIGN KEY (week_start) REFERENCES MEALPLAN(week_start)
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
