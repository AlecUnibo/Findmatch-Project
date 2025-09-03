const express = require('express');
const router = express.Router();
const pool = require('../db');

// ---- Config in base allo schema DB ----
// true  = hai reso max_players NULLabile (consigliato)
// false = tieni max_players NOT NULL e metti 22/10 per calcio
const USE_NULL_MAX_PLAYERS = true;

// Helper per formattare data/ora (solo per messaggi)
const formatDateTime = (dateTime) => {
  const d = new Date(dateTime);
  const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${date} alle ${time}`;
};

// ---------------------------------------------------------------------------
// GET /api/partite  - lista con filtri (sport/luogo/data/ora) + count partecipanti
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { sport, luogo, data, ora, exclude_user_id } = req.query;

    // Normalizza l’ora: "14" / "14.00" / "14:30" -> "HH:MM"
    const normalizeTime = (raw) => {
      if (!raw) return '';
      let s = String(raw).trim().replace(',', ':').replace('.', ':');
      const m = s.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
      if (!m) return '';
      const hh = String(Math.min(23, parseInt(m[1], 10))).padStart(2, '0');
      const mm = String(Math.min(59, parseInt(m[2] ?? '0', 10))).padStart(2, '0');
      return `${hh}:${mm}`;
    };
    const oraNorm = normalizeTime(ora);

    let query = `
      SELECT
        e.*,
        u.username AS organizer_name,
        COUNT(p.user_id) AS partecipanti
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN participants p ON e.id = p.event_id
      WHERE 1=1
    `;

    const values = [];
    let i = 1;
    const push = (v) => { values.push(v); return `$${i++}`; };

    // Filtri base (sport/luogo)
    if (sport && sport.trim()) {
      query += ` AND LOWER(e.sport) LIKE ${push(`%${sport.toLowerCase().trim()}%`)}`;
    }
    if (luogo && luogo.trim()) {
      query += ` AND LOWER(e.location) LIKE ${push(`%${luogo.toLowerCase().trim()}%`)}`;
    }

    // Logica combinata data/ora
    if (data && oraNorm) {
      // FINESTRA 1 ORA: [data+ora, data+ora+1h)
      const start = `${data} ${oraNorm}:00`; // 'YYYY-MM-DD HH:MM:SS'
      const p1 = push(start);
      const p2 = push(start);
      query += `
        AND e.date_time >= ${p1}
        AND e.date_time < (${p2}::timestamp + INTERVAL '1 hour')
      `;

      // Se e.date_time è TIMESTAMPTZ in UTC e vuoi filtrare in Europe/Rome, usa questa variante al posto di quella sopra:
      // query += `
      //   AND (e.date_time AT TIME ZONE 'Europe/Rome') >= ${p1}
      //   AND (e.date_time AT TIME ZONE 'Europe/Rome') < (${p2}::timestamp + INTERVAL '1 hour')
      // `;

    } else {
      if (data) {
        query += ` AND e.date_time::date = ${push(data)}`;
      }
      if (oraNorm) {
        // Solo fascia oraria (qualsiasi giorno): [HH:MM, HH:MM+1h)
        const t1 = push(`${oraNorm}`);
        const t2 = push(`${oraNorm}`);
        query += `
          AND (e.date_time::time >= ${t1}::time)
          AND (e.date_time::time < (${t2}::time + INTERVAL '1 hour'))
        `;

        // Variante per TIMESTAMPTZ (UTC) con filtro in Europe/Rome:
        // query += `
        //   AND ((e.date_time AT TIME ZONE 'Europe/Rome')::time >= ${t1}::time)
        //   AND ((e.date_time AT TIME ZONE 'Europe/Rome')::time < (${t2}::time + INTERVAL '1 hour'))
        // `;
      }
    }

    // Escludi eventi a cui l'utente è già iscritto (fix: usa 'i' corretto)
    if (exclude_user_id) {
      const pid = push(exclude_user_id);
      query += ` AND NOT EXISTS (
        SELECT 1 FROM participants px
        WHERE px.event_id = e.id AND px.user_id = ${pid}
      )`;
    }

    query += `
      GROUP BY e.id, u.username
      ORDER BY e.date_time ASC
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero partite:', error);
    res.status(500).json({ error: 'Errore nel recupero partite' });
  }
});


// ---------------------------------------------------------------------------
// POST /api/partite  - crea evento (con ruoli per Calcio 11/5)
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      sport,
      location,
      date_time,
      max_players,     // per sport non-calcio
      description,
      organizer_id,
      roles_needed     // per calcio 11/5: es. { portiere:1, difensore:2, ... }
    } = req.body;

   // Validazioni base
    if (!sport || !location || !date_time || !description || !organizer_id) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }

    await pool.query('BEGIN');

    // Controllo: verifica partite esistenti a meno di 2 ore di distanza
    const timeConflictCheck = await pool.query(
      `SELECT id, date_time FROM events
       WHERE organizer_id = $1
       AND date_time BETWEEN $2::timestamp - interval '2 hours' AND $2::timestamp + interval '2 hours'`,
      [organizer_id, date_time]
    );

    if (timeConflictCheck.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(409).json({ error: 'Hai già creato un\'altra partita a meno di 2 ore di distanza da questo orario.' });
    }

    const isCalcio = (sport === 'Calcio a 11' || sport === 'Calcio a 5');

    // Calcolo valori da salvare
    let rolesNeededToSave = {};
    let maxPlayersToSave = null;

    if (isCalcio) {
      // Tieni solo ruoli con valore > 0
      Object.entries(roles_needed || {}).forEach(([k, v]) => {
        const n = Number(v || 0);
        if (n > 0) rolesNeededToSave[k] = n;
      });

      if (Object.keys(rolesNeededToSave).length === 0) {
        return res.status(400).json({ error: 'Devi selezionare almeno un ruolo per il calcio.' });
      }

      if (USE_NULL_MAX_PLAYERS) {
        maxPlayersToSave = null; // DB consente NULL (Opzione A)
      } else {
        // Opzione B: max_players obbligatorio → totale coerente
        maxPlayersToSave = (sport === 'Calcio a 11') ? 22 : 10;
      }
    } else {
      const mp = Number(max_players);
      if (!mp || mp <= 0) {
        return res.status(400).json({ error: 'max_players deve essere > 0 per questo sport.' });
      }
      maxPlayersToSave = mp;
      rolesNeededToSave = {}; // niente ruoli per sport non-calcio
    }

    await pool.query('BEGIN');

    const insertSql = `
      INSERT INTO events
        (sport, location, date_time, max_players, roles_needed, description, organizer_id, created_at)
      VALUES
        ($1,    $2,       $3,        $4,          $5::jsonb,   $6,          $7,           NOW())
      RETURNING *
    `;
    const params = [
      sport,
      location,
      date_time,
      maxPlayersToSave,
      JSON.stringify(rolesNeededToSave),
      description,
      organizer_id
    ];

    const { rows } = await pool.query(insertSql, params);
    const newEvent = rows[0];

    // L'organizzatore partecipa di default
    await pool.query(
      'INSERT INTO participants (user_id, event_id) VALUES ($1, $2)',
      [organizer_id, newEvent.id]
    );

    // Notifiche ai follower (best-effort)
    try {
      const orgRes = await pool.query('SELECT username FROM users WHERE id = $1', [organizer_id]);
      const organizerUsername = orgRes.rows[0]?.username || 'Un utente';

      // Queste tabelle potrebbero non esistere in tutti gli ambienti: proteggiamo con try/catch
      const followersRes = await pool.query('SELECT follower_id FROM followers WHERE user_id = $1', [organizer_id]);
      const followers = followersRes.rows;

      const d = new Date(newEvent.date_time);
      const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      const message = `${organizerUsername} ha creato una partita di ${sport} per il ${date} alle ${time} a ${newEvent.location}. Unisciti!`;

      for (const follower of followers) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
           VALUES ($1, $2, $3, 'nuova_partita_seguito', $4)`,
          [follower.follower_id, organizer_id, newEvent.id, message]
        );
      }
    } catch (notificationError) {
      console.error('Errore (non bloccante) durante la notifica ai follower:', notificationError);
    }

    await pool.query('COMMIT');
    res.status(201).json(newEvent);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Errore nella creazione della partita:', err);
    res.status(500).json({ error: 'Errore nella creazione della partita' });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/partite/:id  - aggiorna evento (supporta ruoli e max_players/null)
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const {
      sport,
      location,
      date_time,
      max_players,     // per sport non-calcio
      description,
      organizer_id,
      roles_needed     // per calcio 11/5
    } = req.body;

    if (!sport || !location || !date_time || !description) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }

    const isCalcio = (sport === 'Calcio a 11' || sport === 'Calcio a 5');

    let rolesNeededToSave = {};
    let maxPlayersToSave = null;

    if (isCalcio) {
      Object.entries(roles_needed || {}).forEach(([k, v]) => {
        const n = Number(v || 0);
        if (n > 0) rolesNeededToSave[k] = n;
      });
      if (Object.keys(rolesNeededToSave).length === 0) {
        return res.status(400).json({ error: 'Devi selezionare almeno un ruolo per il calcio.' });
      }
      if (USE_NULL_MAX_PLAYERS) {
        maxPlayersToSave = null;
      } else {
        maxPlayersToSave = (sport === 'Calcio a 11') ? 22 : 10;
      }
    } else {
      const mp = Number(max_players);
      if (!mp || mp <= 0) {
        return res.status(400).json({ error: 'max_players deve essere > 0 per questo sport.' });
      }
      maxPlayersToSave = mp;
      rolesNeededToSave = {};
    }

    await pool.query('BEGIN');

    const updateSql = `
      UPDATE events
      SET sport = $1,
          location = $2,
          date_time = $3,
          max_players = $4,
          roles_needed = $5::jsonb,
          description = $6
      WHERE id = $7
      RETURNING *
    `;
    const params = [
      sport,
      location,
      date_time,
      maxPlayersToSave,
      JSON.stringify(rolesNeededToSave),
      description,
      id
    ];

    const result = await pool.query(updateSql, params);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Partita non trovata' });
    }

    // Notifica i partecipanti (best-effort)
    try {
      if (organizer_id) {
        const participantsRes = await pool.query(
          'SELECT user_id FROM participants WHERE event_id = $1 AND user_id != $2',
          [id, organizer_id]
        );
        const participants = participantsRes.rows;
        const message = `I dettagli della partita di ${sport} del ${formatDateTime(date_time)} sono stati aggiornati. Controlla le modifiche!`;

        for (const participant of participants) {
          await pool.query(
            `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
             VALUES ($1, $2, $3, 'partita_aggiornata', $4)`,
            [participant.user_id, organizer_id, id, message]
          );
        }
      }
    } catch (notificationError) {
      console.error('Errore (non bloccante) durante la notifica di modifica partita:', notificationError);
    }

    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Errore durante aggiornamento partita:', err);
    res.status(500).json({ error: 'Errore durante aggiornamento partita' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/partite/:id  - elimina e notifica i partecipanti
// ---------------------------------------------------------------------------
// DELETE /api/partite/:id  - elimina e notifica i partecipanti
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1) Recupera evento (serve anche organizer_id per le notifiche)
    const evRes = await client.query(
      'SELECT id, sport, date_time, location, organizer_id FROM events WHERE id = $1',
      [id]
    )
    if (evRes.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Partita non trovata o già eliminata' })
    }
    const ev = evRes.rows[0]

    // 2) Prendi i partecipanti (escludi l’organizzatore)
    const partRes = await client.query(
      'SELECT user_id FROM participants WHERE event_id = $1 AND user_id <> $2',
      [id, ev.organizer_id]
    )
    const participants = partRes.rows

    // 3) Elimina dipendenze (FK safe)
    await client.query('DELETE FROM participants WHERE event_id = $1', [id])

    // 4) Elimina evento
    await client.query('DELETE FROM events WHERE id = $1', [id])

    // 5) Notifiche (best effort)
    try {
      const message = `La partita di ${ev.sport} del ${formatDateTime(ev.date_time)} a ${ev.location} è stata annullata dall'organizzatore.`
      for (const { user_id } of participants) {
        await client.query(
          `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
           VALUES ($1, $2, $3, 'partita_annullata', $4)`,
          [user_id, ev.organizer_id, ev.id, message]
        )
      }
    } catch (notifErr) {
      console.error('Notifiche annullamento (non bloccante):', notifErr)
      // non facciamo ROLLBACK per le notifiche
    }

    await client.query('COMMIT')
    // 204 = no content
    return res.status(204).send()
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Errore durante eliminazione partita:', err)
    return res.status(500).json({ error: 'Errore durante eliminazione partita' })
  } finally {
    client.release()
  }
})

// ---------------------------------------------------------------------------
// POST /api/partite/:id/invite  - invito a un utente
// ---------------------------------------------------------------------------
router.post('/:id/invite', async (req, res) => {
  const { id: eventId } = req.params;
  const { inviterId, inviteeId } = req.body;

  if (!inviterId || !inviteeId) {
    return res.status(400).json({ error: 'ID mancanti per l\'invito.' });
  }
  if (inviterId === inviteeId) {
    return res.status(400).json({ error: 'Non puoi invitare te stesso.' });
  }

  try {
    const eventRes = await pool.query(
      'SELECT sport, date_time, location FROM events WHERE id = $1',
      [eventId]
    );
    const inviterRes = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [inviterId]
    );

    if (eventRes.rows.length === 0 || inviterRes.rows.length === 0) {
      return res.status(404).json({ error: 'Partita o utente non trovato.' });
    }

    const { sport, date_time, location } = eventRes.rows[0];
    const { username: inviterUsername } = inviterRes.rows[0];

    const d = new Date(date_time);
    const formattedDateTime = `${d.toLocaleDateString('it-IT')} alle ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;

    const message = `${inviterUsername} ti ha invitato alla sua partita di ${sport} del ${formattedDateTime} a ${location}.`;

    await pool.query(
      `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
       VALUES ($1, $2, $3, 'invito_partita', $4)`,
      [inviteeId, inviterId, eventId, message]
    );

    res.status(200).json({ message: 'Invito inviato con successo!' });
  } catch (err) {
    console.error('Errore durante l\'invio dell\'invito:', err);
    res.status(500).json({ error: 'Errore del server.' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/partite/:id  - dettaglio singolo evento
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        e.*,
        u.username AS organizer_name,
        (SELECT COUNT(*) FROM participants p WHERE p.event_id = e.id) AS partecipanti
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partita non trovata' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Errore nel recupero della partita ${id}:`, error);
    res.status(500).json({ error: 'Errore nel recupero della partita' });
  }
});

module.exports = router;
