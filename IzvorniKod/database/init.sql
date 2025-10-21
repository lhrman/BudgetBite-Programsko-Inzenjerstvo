--
-- PostgreSQL database dump
--


-- Dumped from database version 18.0 (Ubuntu 18.0-1.pgdg24.04+3)
-- Dumped by pg_dump version 18.0 (Ubuntu 18.0-1.pgdg24.04+3)

-- Started on 2025-10-21 14:42:55 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 908 (class 1247 OID 16594)
-- Name: meal_slot; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.meal_slot AS ENUM (
    'breakfast',
    'lunch',
    'dinner',
    'snack'
);


ALTER TYPE public.meal_slot OWNER TO postgres;

--
-- TOC entry 878 (class 1247 OID 16402)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'student',
    'creator',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 245 (class 1255 OID 16427)
-- Name: prevent_role_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.prevent_role_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF (OLD.role_chosen_at IS NOT NULL AND NEW.role <> OLD.role) THEN
    RAISE EXCEPTION 'User role cannot be changed after first choice';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.prevent_role_change() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 239 (class 1259 OID 16650)
-- Name: challenges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.challenges (
    id bigint NOT NULL,
    title text NOT NULL,
    description text,
    reward_points integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.challenges OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16649)
-- Name: challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.challenges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.challenges_id_seq OWNER TO postgres;

--
-- TOC entry 3652 (class 0 OID 0)
-- Dependencies: 238
-- Name: challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.challenges_id_seq OWNED BY public.challenges.id;


--
-- TOC entry 222 (class 1259 OID 16430)
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id bigint NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16429)
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_id_seq OWNER TO postgres;

--
-- TOC entry 3653 (class 0 OID 0)
-- Dependencies: 221
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- TOC entry 230 (class 1259 OID 16544)
-- Name: ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient (
    id bigint NOT NULL,
    name text NOT NULL,
    default_unit text,
    calories_per_unit numeric(10,4)
);


ALTER TABLE public.ingredient OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16543)
-- Name: ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredient_id_seq OWNER TO postgres;

--
-- TOC entry 3654 (class 0 OID 0)
-- Dependencies: 229
-- Name: ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredient_id_seq OWNED BY public.ingredient.id;


--
-- TOC entry 235 (class 1259 OID 16604)
-- Name: mealplan_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mealplan_items (
    id bigint NOT NULL,
    mealplan_id bigint,
    day_of_week smallint,
    meal_slot public.meal_slot NOT NULL,
    recipe_id bigint,
    CONSTRAINT mealplan_items_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


ALTER TABLE public.mealplan_items OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16603)
-- Name: mealplan_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mealplan_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mealplan_items_id_seq OWNER TO postgres;

--
-- TOC entry 3655 (class 0 OID 0)
-- Dependencies: 234
-- Name: mealplan_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mealplan_items_id_seq OWNED BY public.mealplan_items.id;


--
-- TOC entry 233 (class 1259 OID 16577)
-- Name: mealplans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mealplans (
    id bigint NOT NULL,
    user_id bigint,
    week_start date NOT NULL,
    total_cost numeric(8,2),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.mealplans OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16576)
-- Name: mealplans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mealplans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mealplans_id_seq OWNER TO postgres;

--
-- TOC entry 3656 (class 0 OID 0)
-- Dependencies: 232
-- Name: mealplans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mealplans_id_seq OWNED BY public.mealplans.id;


--
-- TOC entry 237 (class 1259 OID 16626)
-- Name: mood_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mood_entries (
    id bigint NOT NULL,
    user_id bigint,
    consumed_at timestamp with time zone DEFAULT now() NOT NULL,
    recipe_id bigint,
    mood_before smallint,
    mood_after smallint,
    notes text,
    CONSTRAINT mood_entries_mood_after_check CHECK (((mood_after >= 1) AND (mood_after <= 5))),
    CONSTRAINT mood_entries_mood_before_check CHECK (((mood_before >= 1) AND (mood_before <= 5)))
);


ALTER TABLE public.mood_entries OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16625)
-- Name: mood_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mood_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mood_entries_id_seq OWNER TO postgres;

--
-- TOC entry 3657 (class 0 OID 0)
-- Dependencies: 236
-- Name: mood_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mood_entries_id_seq OWNED BY public.mood_entries.id;


--
-- TOC entry 242 (class 1259 OID 16685)
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    id bigint NOT NULL,
    user_id bigint,
    recipe_id bigint,
    score smallint NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ratings_score_check CHECK (((score >= 1) AND (score <= 5)))
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16684)
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ratings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ratings_id_seq OWNER TO postgres;

--
-- TOC entry 3658 (class 0 OID 0)
-- Dependencies: 241
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- TOC entry 228 (class 1259 OID 16498)
-- Name: recipe_equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_equipment (
    equipment_id bigint NOT NULL,
    recipe_id bigint NOT NULL
);


ALTER TABLE public.recipe_equipment OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16556)
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_ingredients (
    recipe_id bigint NOT NULL,
    ingredient_id bigint NOT NULL,
    quantity numeric(10,3) NOT NULL,
    unit text
);


ALTER TABLE public.recipe_ingredients OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16480)
-- Name: recipe_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_media (
    id bigint NOT NULL,
    recipe_id bigint,
    media_type text NOT NULL,
    media_url text NOT NULL,
    caption text,
    sort_order smallint DEFAULT 1,
    CONSTRAINT recipe_media_media_type_check CHECK ((media_type = ANY (ARRAY['image'::text, 'video'::text])))
);


ALTER TABLE public.recipe_media OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16479)
-- Name: recipe_media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipe_media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_media_id_seq OWNER TO postgres;

--
-- TOC entry 3659 (class 0 OID 0)
-- Dependencies: 226
-- Name: recipe_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipe_media_id_seq OWNED BY public.recipe_media.id;


--
-- TOC entry 225 (class 1259 OID 16460)
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id bigint NOT NULL,
    name text NOT NULL,
    creator_id bigint,
    description text,
    price_estimate numeric(8,2),
    prep_time_min integer,
    instructions text,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16459)
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_id_seq OWNER TO postgres;

--
-- TOC entry 3660 (class 0 OID 0)
-- Dependencies: 224
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- TOC entry 244 (class 1259 OID 16710)
-- Name: reflections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reflections (
    id bigint NOT NULL,
    user_id bigint,
    week_start date NOT NULL,
    summary_text text,
    total_spent numeric(8,2),
    home_cooked_meals integer,
    avg_mood numeric(3,2),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reflections OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16709)
-- Name: reflections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reflections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reflections_id_seq OWNER TO postgres;

--
-- TOC entry 3661 (class 0 OID 0)
-- Dependencies: 243
-- Name: reflections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reflections_id_seq OWNED BY public.reflections.id;


--
-- TOC entry 240 (class 1259 OID 16662)
-- Name: user_challenges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_challenges (
    user_id bigint NOT NULL,
    challenge_id bigint NOT NULL,
    status text DEFAULT 'assigned'::text,
    assigned_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT user_challenges_status_check CHECK ((status = ANY (ARRAY['assigned'::text, 'completed'::text])))
);


ALTER TABLE public.user_challenges OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16442)
-- Name: user_equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_equipment (
    user_id bigint NOT NULL,
    equipment_id bigint NOT NULL
);


ALTER TABLE public.user_equipment OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16410)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email text NOT NULL,
    name text,
    auth_provider text,
    provider_user_id text,
    weekly_budget numeric(8,2),
    goals text,
    role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
    role_chosen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_email_check CHECK ((email ~~ '_%@_%._%'::text))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16409)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3662 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3395 (class 2604 OID 16653)
-- Name: challenges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.challenges ALTER COLUMN id SET DEFAULT nextval('public.challenges_id_seq'::regclass);


--
-- TOC entry 3383 (class 2604 OID 16433)
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- TOC entry 3389 (class 2604 OID 16547)
-- Name: ingredient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient ALTER COLUMN id SET DEFAULT nextval('public.ingredient_id_seq'::regclass);


--
-- TOC entry 3392 (class 2604 OID 16607)
-- Name: mealplan_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mealplan_items ALTER COLUMN id SET DEFAULT nextval('public.mealplan_items_id_seq'::regclass);


--
-- TOC entry 3390 (class 2604 OID 16580)
-- Name: mealplans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mealplans ALTER COLUMN id SET DEFAULT nextval('public.mealplans_id_seq'::regclass);


--
-- TOC entry 3393 (class 2604 OID 16629)
-- Name: mood_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mood_entries ALTER COLUMN id SET DEFAULT nextval('public.mood_entries_id_seq'::regclass);


--
-- TOC entry 3400 (class 2604 OID 16688)
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- TOC entry 3387 (class 2604 OID 16483)
-- Name: recipe_media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_media ALTER COLUMN id SET DEFAULT nextval('public.recipe_media_id_seq'::regclass);


--
-- TOC entry 3384 (class 2604 OID 16463)
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- TOC entry 3402 (class 2604 OID 16713)
-- Name: reflections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reflections ALTER COLUMN id SET DEFAULT nextval('public.reflections_id_seq'::regclass);


--
-- TOC entry 3380 (class 2604 OID 16413)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


-- Completed on 2025-10-21 14:42:55 CEST

--
-- PostgreSQL database dump complete
--

