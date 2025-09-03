--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, created_at, username) FROM stdin;
9	Nico Ghiselli	nico.ghiselli@gmail.com	$2b$10$2Q/I30lqLGyoSIG.HufFYO7HcjFct8qnmu0obQD3lpqLwPnOkBdcu	2025-07-29 17:01:37.65455	Ghiso
3	Alessandro Cacchi	ale03ca@gmail.com	$2b$10$Mgx6iRRFvbOQar1BUHzS9uWN6rrA/nzO/7rKTU11XbGNXK5dAXjBC	2025-07-28 14:45:55.768181	Alec03
4	Stefano Tassinari	stefano.tassinari6@studio.unibo.it	$2b$10$rZTS8o5NWjV9rw5FHhCO1upMDsCeVJu2iSCpzFq4i619VGSp531Ei	2025-07-28 15:49:09.524362	SteTasso
7	Alessandro	alecacchiadds@gmail.com	$2b$10$K0AFNLuu7.jVBr147mS9ROnGyoq8/6JdmSR8wquP3rdooSIVJYknC	2025-07-29 16:54:49.050342	AleCacchiAds
8	Marco	marco.rossi@gmail.com	$2b$10$n3XlTGQpJnSvyyO6a2o78uXl3yw9mXdOz80XNzTOuygkCfibOeLIm	2025-07-29 16:56:56.925424	MRossi
10	Luca Zenobi	luca.zeno@gmail.com	$2b$10$EAy8NiFGOwVZZqAuWCexneE9LBWOgE9HOiZdojhEkhAGeZd1jGVcO	2025-07-29 19:33:21.598815	LucaZeno
\.

--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, sport, location, date_time, max_players, description, organizer_id, created_at) FROM stdin;
27	Calcio a 11	47042 Cesenatico FC, Italia	2025-08-04 19:00:00	3	Polisportiva Cesenatico - Prezzo €5,00 - Maglietta Bianca	4	2025-08-04 14:38:51.812787
28	Beach Volley	47035 Gambettola FC, Italia	2025-08-11 20:00:00	1	Campo Comunale Sabbione - Via T. Battelli 53	4	2025-08-04 14:40:00.748475
29	Basket	Cesena FC, Italia	2025-08-07 21:00:00	2	Palaippo Cesena, campo delle scuole - Casacca nera	3	2025-08-04 14:45:12.012355
30	Tennis	Forlì FC, Italia	2025-08-09 14:00:00	1	Polisportiva Forlì - Singolo veloce - Costo €5 per il campo	3	2025-08-04 14:45:59.446765
31	Padel	47522 Martorano FC, Italia	2025-08-07 15:00:00	2	Campo di fronte al Toys Center, Martorano - €5 per campo	3	2025-08-04 15:27:03.329953
32	Racchettoni	Cesena FC, Italia	2025-08-12 20:00:00	2	€5 per il campo - Spiaggia 23	3	2025-08-04 17:03:27.350674
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, event_id, user_id, content, "timestamp") FROM stdin;
\.


--
-- Data for Name: participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participants (user_id, event_id) FROM stdin;
3	28
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 32, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

