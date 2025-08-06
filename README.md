# Come creare e aggiornare DataBase

## 1. Creazione del database in PostgreSQL (usando pgAdmin)
1. Apri pgAdmin

2. Connettiti al tuo server PostgreSQL (di solito "PostgreSQL 15", "17", ecc.)
3. Click destro su Databases → Create → Database
4. Imposta:
- Database name: findmatch_db
- Owner: postgres (o altro utente valido)
5. Clicca su Save

## 2. Inizializzazione del database

```bash
psql -U postgres -d findmatch_db -f migrations/001_init_schema.sql
psql -U postgres -d findmatch_db -f migrations/002_seed_data.sql  
```

> Inserisci la password dell’utente postgres quando richiesto.

Se stai usando pgAdmin, puoi eseguire i file .sql così:

1. Tasto destro su findmatch_db → Query Tool

2. Apri 001_init_schema.sql → clic su "Esegui"

3. Ripeti per 002_seed_data.sql

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
3. Fai il commit del file su Git:


```bash
git add migrations/003_add_tabella_eventi.sql
git commit -m "Aggiunta tabella eventi"
git push
```
4. Gli altri potranno applicare le modifiche con:

```bash
psql -U postgres -d findmatch_db -f migrations/003_add_tabella_eventi
```

## RIEPILOGO COMANDI

Creazione DB (una volta sola):
```bash
createdb -U postgres findmatch_db
```
Applicazione struttura iniziale:
```bash
psql -U postgres -d findmatch_db -f migrations/001_init_schema.sql
psql -U postgres -d findmatch_db -f migrations/002_seed_data.sql
```
Esecuzione di nuove migrazioni:
```bash
psql -U postgres -d findmatch_db -f migrations/NNN_nome_migrazione.sql
```
