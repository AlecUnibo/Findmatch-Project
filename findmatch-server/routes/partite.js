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

    if (sport) {
      query += ` AND LOWER(e.sport) LIKE $${i}`;
      values.push(`%${sport.toLowerCase()}%`);
      i++;
    }
    if (luogo) {
      query += ` AND LOWER(e.location) LIKE $${i}`;
      values.push(`%${luogo.toLowerCase()}%`);
      i++;
    }
    if (data) {
      query += ` AND e.date_time::date = $${i}`;
      values.push(data);
      i++;
    }
    if (ora) {
      query += ` AND e.date_time::time >= $${i}`;
      values.push(ora);
      i++;
    }

    if (exclude_user_id) {
      query += ` AND NOT EXISTS (
        SELECT 1 FROM participants px
        WHERE px.event_id = e.id AND px.user_id = $${counter}
      )`;
      values.push(exclude_user_id);
      counter++;
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
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await pool.query('BEGIN');

    const participantsRes = await pool.query(
      'SELECT user_id FROM participants WHERE event_id = $1 AND user_id != $2',
      [id, userId]
    );
    const participants = participantsRes.rows;

    const eventRes = await pool.query(
      'SELECT sport, date_time, location FROM events WHERE id = $1',
      [id]
    );
    const eventDetails = eventRes.rows[0] || null;

    const deleteResult = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Partita non trovata o già eliminata' });
    }

    if (eventDetails) {
      const message = `La partita di ${eventDetails.sport} del ${formatDateTime(eventDetails.date_time)} a ${eventDetails.location} è stata annullata dall'organizzatore.`;
      for (const participant of participants) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, type, message)
           VALUES ($1, $2, 'partita_annullata', $3)`,
          [participant.user_id, userId, message]
        );
      }
    }

    await pool.query('COMMIT');
    res.json({ message: 'Partita eliminata con successo e partecipanti notificati' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Errore durante eliminazione partita:', err);
    res.status(500).json({ error: 'Errore durante eliminazione partita' });
  }
});

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
