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

COPY public.users (id, name, email, password_hash, created_at, username, bio, followers_count) FROM stdin;

3	Alessandro Cacchi	ale03ca@gmail.com	$2b$10$Mgx6iRRFvbOQar1BUHzS9uWN6rrA/nzO/7rKTU11XbGNXK5dAXjBC	2025-07-28 14:45:55.768181	Alec03  Alessandro CAcchi
4	Stefano Tassinari	stefano.tassinari6@studio.unibo.it	$2b$10$rZTS8o5NWjV9rw5FHhCO1upMDsCeVJu2iSCpzFq4i619VGSp531Ei	2025-07-28 15:49:09.524362	SteTasso    Stefano Tassinari
11	Nico Ghiselli	nico.ghiselli@gmail.com	$2b$10$2Q/I30lqLGyoSIG.HufFYO7HcjFct8qnmu0obQD3lpqLwPnOkBdcu	2025-07-29 17:01:37.65455   Ghiso   Nico Ghiselli
10	Luca Zenobi	luca.zeno@gmail.com	$2b$10$EAy8NiFGOwVZZqAuWCexneE9LBWOgE9HOiZdojhEkhAGeZd1jGVcO	2025-07-29 19:33:21.598815	LucaZeno    Luca Zenobi
12	Marco	marco.rossi@gmail.com	$2b$10$n3XlTGQpJnSvyyO6a2o78uXl3yw9mXdOz80XNzTOuygkCfibOeLIm	2025-07-29 16:56:56.925424	MRossi  Marco Rossi
13  Andrea Massocco andrea.massocco@gmail.com   $2b$10$OBNj5k28SClPRgHu/CeJb.g3UAi2y6qMfFnInlznwVwNuWHbux5G2    2025-09-03 14:36:08.727699  Patuffi Andrea Massocco
14  Riccardo Bertozzi rich.bertozzi@gmail.com   $2b$10$OfgQ.rTHcmSbC9spDHi3w.pao1nBffG/12krqfFR8t6BiwtuQqOCe    2025-09-03 14:37:56.255143  Berto   Riccardo Bertozzi
15  Filippo Zannoli filippo.zannoli@gmail.com   $2b$10$G.swt0DGjsBxrjqGJOsmxOsc4BykPS4IoNguzfLc0.YJgPpmJrjGK    2025-09-03 14:39:36.527127  Filo Filippo Zannoli
16  Pietro Rasi pietro.rasi@gmail.com   $2b$10$NE8cqvSmJwykuQcr/JfzfuLWzCLOk3mDrkhbetkSWoBMxP3Sj2aE6    2025-09-03 14:40:15.225662  Pie Pietro Rasi
\.

--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, sport, location, date_time, max_players, description, organizer_id, created_at, roles_needed) FROM stdin;
33	Calcio a 11	Cesena FC, Italia	2025-10-02 20:30:00	22	Stadio di Quartiere — casacca blu	3	2025-09-04 10:05:00	{"portiere": 2, "difensore": 4, "centrocampista": 6, "attaccante": 3}
34	Basket	Forlì FC, Italia	2025-10-03 21:00:00	10	Palestra Comunale — livello amatoriale	4	2025-09-04 10:06:00	{}
35	Padel	47042 Cesenatico FC, Italia	2025-10-04 16:00:00	4	Centro Padel Levante — doppio amichevole	10	2025-09-04 10:07:00	{}
36	Calcio a 5	Cesena FC, Italia	2025-10-05 18:30:00	10	PalaFive Martorano — scarpe da calcetto	11	2025-09-04 10:08:00	{"portiere": 1, "all-around": 4}
37	Tennis	Savignano sul Rubicone FC, Italia	2025-10-06 19:00:00	2	Circolo Tennis — singolare rapido	12	2025-09-04 10:09:00	{}
38	Beach Volley	47042 Cesenatico FC, Italia	2025-10-07 20:00:00	6	Spiaggia 22 — serale con luci	13	2025-09-04 10:10:00	{}
39	Calcio a 11	Forlimpopoli FC, Italia	2025-10-08 21:00:00	22	Campo Comunale — maglia chiara	14	2025-09-04 10:11:00	{"portiere": 1, "difensore": 5, "centrocampista": 5, "attaccante": 4}
40	Pallavolo	Cesena FC, Italia	2025-10-09 20:30:00	12	Palestra XXV Aprile — misto livello intermedio	15	2025-09-04 10:12:00	{}
41	Calcio a 5	47522 Martorano FC, Italia	2025-10-10 19:30:00	10	PalaMartorano — casacca nera	16	2025-09-04 10:13:00	{"portiere": 1, "all-around": 3}
42	Racchettoni	47042 Cesenatico FC, Italia	2025-10-11 17:00:00	4	Spiaggia 23 — attrezzatura disponibile	3	2025-09-04 10:14:00	{}
43	Tennis	Forlì FC, Italia	2025-10-12 09:30:00	4	Doppi veloci — quota campo divisa	4	2025-09-04 10:15:00	{}
44	Calcio a 11	Cesena FC, Italia	2025-10-13 20:45:00	22	Stadio parrocchiale — arbitro incluso	10	2025-09-04 10:16:00	{"portiere": 2, "difensore": 3, "centrocampista": 7, "attaccante": 2}
45	Racchettoni	Cesenatico FC, Italia	2025-10-14 18:00:00	4	Spiaggia 20 — racchette a noleggio	11	2025-09-04 10:17:00	{}
46	Basket	Forlì FC, Italia	2025-10-15 21:15:00	12	Pala Romiti — scrimmage amichevole	12	2025-09-04 10:18:00	{}
47	Padel	Cesena FC, Italia	2025-10-16 19:00:00	4	Club Padel Malatestiano — livello base	13	2025-09-04 10:19:00	{}
48	Calcio a 5	Gambettola FC, Italia	2025-10-17 20:00:00	10	Palazzetto — spogliatoi disponibili	14	2025-09-04 10:20:00	{"portiere": 1, "all-around": 5}
49	Pallavolo	Forlimpopoli FC, Italia	2025-10-18 18:30:00	10	Palestra Comunale — rete regolabile	15	2025-09-04 10:21:00	{}
50	Calcio a 11	Cesena FC, Italia	2025-10-19 10:30:00	22	Campo Universitario — casacca rossa	16	2025-09-04 10:22:00	{"portiere": 1, "difensore": 4, "centrocampista": 6, "attaccante": 3}
51	Beach Volley	Cesenatico FC, Italia	2025-11-02 15:00:00	8	Spiaggia 26 — torneo lampo	3	2025-09-04 10:23:00	{}
52	Basket	Cesena FC, Italia	2025-11-03 20:45:00	12	Palestra Liceo — serve casacca chiara	4	2025-09-04 10:24:00	{}
53	Calcio a 5	Cesena FC, Italia	2025-11-04 21:00:00	10	Centro Sportivo Alpi — parquet nuovo	10	2025-09-04 10:25:00	{"portiere": 2, "all-around": 4}
54	Padel	Savignano sul Rubicone FC, Italia	2025-11-05 19:30:00	4	Indoor Padel — aria condizionata	11	2025-09-04 10:26:00	{}
55	Calcio a 11	Forlì FC, Italia	2025-11-06 20:30:00	22	Campo n.2 — docce disponibili	12	2025-09-04 10:27:00	{"portiere": 1, "difensore": 5, "centrocampista": 5, "attaccante": 3}
56	Pallavolo	Cesena FC, Italia	2025-11-07 20:00:00	14	Palestra Ippodromo — misto, livello libero	13	2025-09-04 10:28:00	{}
57	Racchettoni	Cesenatico FC, Italia	2025-11-08 16:00:00	4	Spiaggia 18 — sabbia compatta	14	2025-09-04 10:29:00	{}
58	Racchettoni	Cesena FC, Italia	2025-11-09 11:00:00	4	Parco Spazio — area sabbiosa	15	2025-09-04 10:30:00	{}
59	Tennis	Forlì FC, Italia	2025-11-10 18:30:00	2	Campo coperto — palleggio intenso	16	2025-09-04 10:31:00	{}
60	Calcio a 5	Cesena FC, Italia	2025-11-11 19:45:00	10	PalaSavio — partitone del martedì	3	2025-09-04 10:32:00	{"portiere": 1, "all-around": 3}
61	Basket	Gambettola FC, Italia	2025-11-12 21:00:00	10	Palestra Media — 5vs5 a rotazione	4	2025-09-04 10:33:00	{}
62	Padel	47042 Cesenatico FC, Italia	2025-11-13 17:30:00	4	Club Levante — campo 2 prenotato	10	2025-09-04 10:34:00	{}
63	Calcio a 11	Cesena FC, Italia	2025-11-14 20:45:00	22	Campo Ex Roverella — si gioca anche con pioggia	11	2025-09-04 10:35:00	{"portiere": 2, "difensore": 3, "centrocampista": 6, "attaccante": 2}
64	Pallavolo	Forlì FC, Italia	2025-11-15 18:00:00	12	Palestra Comunale B — allenamento libero	12	2025-09-04 10:36:00	{}
65	Beach Volley	Cesenatico FC, Italia	2025-11-16 14:30:00	8	Campo coperto — torneo 4x4	13	2025-09-04 10:37:00	{}
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

