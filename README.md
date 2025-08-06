# 1. Preparazione Ambiente

1. Installare Node.js -> https://nodejs.org/en

2. Installare PostgreSQL -> https://www.postgresql.org/

Come tool relativi a PostgreSQL, quello che ci servirá sará pgAdmin, cosí possiamo tenere traccia delle modifiche al database.
Quindi procedere all'installazione guidata (come porta lasciare la 5432) e come tool installare solo pgAdmin. La password per semplificare il tutto e rendere tutto uguale sará "Prova".

3. Installare i pacchetti npm, all'interno della cartella findmatch_client
```bash
npm install
```

# 2. Creazione e aggiornamento DataBase

## 1. Creazione del database in PostgreSQL (usando pgAdmin)
1. Apri pgAdmin

2. Connettiti al tuo server PostgreSQL (di solito "PostgreSQL 15", "17", ecc.)
3. Click destro su Databases → Create → Database
4. Imposta:
- Database name: findmatch_db
- Owner: postgres (o altro utente valido)
5. Clicca su Save

## 2. Inizializzazione del database
Vai nella cartella del progetto relativa al backend -> findmatch_client, e lancia i seguenti comandi:

```bash
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d findmatch_db -f migrations/001_init_schema.sql
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d findmatch_db -f migrations/002_seed_data.sql
```

> Inserisci la password dell’utente postgres quando richiesto.

## 3. Se si fanno modifiche al DB

> Ogni modifica allo schema (nuove tabelle, colonne, vincoli, ecc.) deve essere salvata in un file .sql separato per essere condivisa

### Esempio:
Hai creato una nuova tabella eventi? Allora:

1. Crea un file nella cartella migrations/ chiamato:

```sql
003_add_tabella_eventi.sql
```
2. Dentro scrivi le istruzioni SQL:

```sql
CREATE TABLE eventi (
  id SERIAL PRIMARY KEY,
  titolo VARCHAR(100),
  sport VARCHAR(50),
  luogo VARCHAR(100),
  data TIMESTAMP,
  creatore_id INTEGER REFERENCES users(id)
);
```
3. Si potranno applicare le modifiche con:

```bash
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d findmatch_db -f migrations/003_add_tabella_eventi
```

# 3. Avviare la web app:
1. Posizionarsi nella cartella findmatch_client e lanciare il seguente comando:
```bash
npm run dev
```
2. Posizionarsi nella cartella findmatch_server e lanciare il seguente comando:
```bash
node index.js
```