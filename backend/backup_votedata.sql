--
-- PostgreSQL database dump
--

\restrict tIcEMuXaefVg0xlKXxtHKMCG1gLGVOjXSmdlhfuVwCRGQoV7bhEbcbsuwaftWaG

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: voters; Type: TABLE; Schema: public; Owner: admin_vote
--

CREATE TABLE public.voters (
    id bigint NOT NULL,
    nik character varying(16) NOT NULL,
    full_name character varying(100) NOT NULL,
    is_used boolean DEFAULT false,
    is_voter_verified boolean DEFAULT false,
    is_human_verified boolean DEFAULT false,
    is_authority boolean DEFAULT false,
    suffix_type character varying(20) DEFAULT 'normal'::character varying,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.voters OWNER TO admin_vote;

--
-- Name: voters_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_vote
--

CREATE SEQUENCE public.voters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.voters_id_seq OWNER TO admin_vote;

--
-- Name: voters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin_vote
--

ALTER SEQUENCE public.voters_id_seq OWNED BY public.voters.id;


--
-- Name: voters id; Type: DEFAULT; Schema: public; Owner: admin_vote
--

ALTER TABLE ONLY public.voters ALTER COLUMN id SET DEFAULT nextval('public.voters_id_seq'::regclass);


--
-- Data for Name: voters; Type: TABLE DATA; Schema: public; Owner: admin_vote
--

COPY public.voters (id, nik, full_name, is_used, is_voter_verified, is_human_verified, is_authority, suffix_type, created_at, updated_at, deleted_at) FROM stdin;
1	8934467044697850	reza mantappu	f	f	f	f	normal	2026-05-19 09:00:43.033085+00	2026-05-19 09:00:43.033085+00	\N
2	2845478991899319	reza sanjaya	f	f	f	f	normal	2026-05-19 09:07:42.643782+00	2026-05-19 09:07:42.643782+00	\N
4	5695323993794999	jajang suparman	f	f	f	f	rejected_999	2026-05-23 07:58:39.263362+00	2026-05-23 07:58:39.263362+00	\N
3	4223953072325832	deden sangkuriang	t	f	f	f	normal	2026-05-22 18:34:45.447591+00	2026-05-22 18:34:45.447591+00	\N
\.


--
-- Name: voters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_vote
--

SELECT pg_catalog.setval('public.voters_id_seq', 4, true);


--
-- Name: voters voters_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_vote
--

ALTER TABLE ONLY public.voters
    ADD CONSTRAINT voters_pkey PRIMARY KEY (id);


--
-- Name: idx_voters_deleted_at; Type: INDEX; Schema: public; Owner: admin_vote
--

CREATE INDEX idx_voters_deleted_at ON public.voters USING btree (deleted_at);


--
-- Name: idx_voters_nik; Type: INDEX; Schema: public; Owner: admin_vote
--

CREATE UNIQUE INDEX idx_voters_nik ON public.voters USING btree (nik);


--
-- PostgreSQL database dump complete
--

\unrestrict tIcEMuXaefVg0xlKXxtHKMCG1gLGVOjXSmdlhfuVwCRGQoV7bhEbcbsuwaftWaG

