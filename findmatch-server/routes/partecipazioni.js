const express = require('express');
const router = express.Router();
const pool = require('../db');

// Funzione helper per formattare la data e l'ora
const formatDateTime = (dateTime) => {
  const d = new Date(dateTime);
  const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${date} alle ${time}`;
};

// Aggiungi partecipazione (supporta ruolo specifico o random per il calcio)
router.post('/', async (req, res) => {
  const { user_id, event_id, role } = req.body; // role: 'portiere' | 'difensore' | ... | 'random' | undefined

  if (!user_id || !event_id) {
    return res.status(400).json({ error: 'ID utente e ID evento sono obbligatori.' });
  }

  try {
    await pool.query('BEGIN');

    // già iscritto?
    const exists = await pool.query(
      'SELECT 1 FROM participants WHERE user_id=$1 AND event_id=$2',
      [user_id, event_id]
    );
    if (exists.rowCount > 0) {
      await pool.query('ROLLBACK');
      return res.status(409).json({ error: 'Risulti già iscritto a questa partita.' });
    }

    // carica evento + numero partecipanti
    const evRes = await pool.query(
      `SELECT e.sport, e.max_players, e.roles_needed,
              (SELECT COUNT(*)::int FROM participants p WHERE p.event_id = e.id) AS partecipanti,
              e.organizer_id, e.date_time, e.location
       FROM events e
       WHERE e.id=$1`,
      [event_id]
    );
    if (evRes.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Partita non trovata. Potrebbe essere stata eliminata.' });
    }
    const ev = evRes.rows[0];
    const isCalcio = ['calcio a 11', 'calcio a 5'].includes(String(ev.sport || '').toLowerCase());

    let assignedRole = null;

    if (isCalcio) {
      const roles = ev.roles_needed || {};
      // ruoli disponibili (>0)
      const avail = Object.entries(roles).filter(([_, v]) => Number(v || 0) > 0);
      if (avail.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(409).json({ error: 'Spiacenti, non ci sono più ruoli disponibili per questa partita.' });
      }

      if (!role || role === 'random') {
        const pick = avail[Math.floor(Math.random() * avail.length)];
        assignedRole = pick[0];
      } else {
        const rLeft = Number(roles[role] || 0);
        if (rLeft <= 0) {
          await pool.query('ROLLBACK');
          return res.status(409).json({ error: `Il ruolo '${role}' non è più disponibile.` });
        }
        assignedRole = role;
      }

      // decremento atomico del ruolo scelto
      const dec = await pool.query(
        `UPDATE events
         SET roles_needed = jsonb_set(roles_needed, ARRAY[$2], to_jsonb(((roles_needed->>$2)::int - 1)))
         WHERE id=$1 AND (roles_needed->>$2)::int > 0
         RETURNING id`,
        [event_id, assignedRole]
      );
      if (dec.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res.status(409).json({ error: `Qualcuno è stato più veloce! Il ruolo '${assignedRole}' è stato appena preso.` });
      }

      await pool.query(
        'INSERT INTO participants (user_id, event_id, role) VALUES ($1,$2,$3)',
        [user_id, event_id, assignedRole]
      );

    } else {
      // sport NON calcio: capienza via max_players
      const max = Number(ev.max_players || 0);
      const cur = Number(ev.partecipanti || 0);
      if (!max || cur >= max) {
        await pool.query('ROLLBACK');
        return res.status(409).json({ error: 'Spiacenti, la partita è al completo.' });
      }
      await pool.query(
        'INSERT INTO participants (user_id, event_id, role) VALUES ($1,$2,NULL)',
        [user_id, event_id]
      );
    }

    // Notifiche (best-effort)
    try {
        const actorRes = await pool.query('SELECT username FROM users WHERE id=$1', [user_id]);
        const actorUsername = actorRes.rows[0]?.username || 'Qualcuno';
        const formattedDateTime = formatDateTime(ev.date_time);
  
        if (String(ev.organizer_id) !== String(user_id)) {
          const msg = isCalcio && assignedRole
            ? `${actorUsername} si è unito alla tua partita di ${ev.sport} del ${formattedDateTime} a ${ev.location} (ruolo: ${assignedRole}).`
            : `${actorUsername} si è unito alla tua partita di ${ev.sport} del ${formattedDateTime} a ${ev.location}.`;
          await pool.query(
            `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
             VALUES ($1, $2, $3, 'partita_unito', $4)`,
            [ev.organizer_id, user_id, event_id, msg]
          );
        }
  
      // per sport non-calcio: se si è completata la capienza, avvisa l’organizzatore
        if (!isCalcio && ev.max_players) {
          const cnt = await pool.query('SELECT COUNT(*)::int AS c FROM participants WHERE event_id=$1', [event_id]);
          if (cnt.rows[0].c === Number(ev.max_players)) {
            const msg = `La tua partita di ${ev.sport} del ${formattedDateTime} a ${ev.location} è al completo!`;
            await pool.query(
              `INSERT INTO notifications (user_id, event_id, type, message)
               VALUES ($1, $2, 'partita_completa', $3)`,
              [ev.organizer_id, event_id, msg]
            );
          }
        }
      } catch (notifErr) {
        console.error('Errore notifica unione (non bloccante):', notifErr);
      }

    await pool.query('COMMIT');
    return res.status(201).json({ message: 'Partecipazione registrata', role: assignedRole || null });
  } catch (err) {
    await pool.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Risulti già iscritto a questa partita.' });
    }
    console.error('Errore partecipazione:', err);
    res.status(500).json({ error: 'Errore del server durante la registrazione alla partita.' });
  }
});

// Rimuovi partecipazione
// Rimuovi partecipazione (rimette a disposizione il ruolo se calcio)
router.delete('/', async (req, res) => {
    const { user_id, event_id } = req.body;
    if (!user_id || !event_id) {
      return res.status(400).json({ error: 'user_id ed event_id sono obbligatori' });
    }
  
    try {
      await pool.query('BEGIN');
  
      // ruolo assegnato a quell'utente in quell'evento?
      const pr = await pool.query(
        'SELECT role FROM participants WHERE user_id=$1 AND event_id=$2',
        [user_id, event_id]
      );
      if (pr.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Non sei iscritto a questa partita' });
      }
      const assignedRole = pr.rows[0].role;
  
      // elimina partecipazione
      await pool.query(
        'DELETE FROM participants WHERE user_id=$1 AND event_id=$2',
        [user_id, event_id]
      );
  
      // ripristina ruolo se esisteva
      if (assignedRole) {
        await pool.query(
          `UPDATE events
           SET roles_needed = jsonb_set(
             roles_needed,
             ARRAY[$2],
             to_jsonb( (COALESCE((roles_needed->>$2),'0')::int + 1) )
           )
           WHERE id=$1`,
          [event_id, assignedRole]
        );
      }
  
      // Notifiche (best-effort)
      try {
        const evRes = await pool.query('SELECT organizer_id, sport, date_time, location FROM events WHERE id=$1', [event_id]);
        if (evRes.rowCount > 0) {
          const ev = evRes.rows[0];
          if (String(ev.organizer_id) !== String(user_id)) {
            const actorRes = await pool.query('SELECT username FROM users WHERE id=$1', [user_id]);
            const actorUsername = actorRes.rows[0]?.username || 'Qualcuno';
            const formattedDateTime = formatDateTime(ev.date_time);
            const msg = `${actorUsername} ha abbandonato la tua partita di ${ev.sport} del ${formattedDateTime} a ${ev.location}.`;
            await pool.query(
              `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
               VALUES ($1, $2, $3, 'partita_abbandonata', $4)`,
              [ev.organizer_id, user_id, event_id, msg]
            );
          }
        }
      } catch (notifErr) {
        console.error('Errore notifica abbandono (non bloccante):', notifErr);
      }
  
      await pool.query('COMMIT');
      res.json({ message: 'Partecipazione rimossa con successo' });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Errore rimozione partecipazione:', err);
      res.status(500).json({ error: 'Errore durante la rimozione della partecipazione' });
    }
  });
  
  
  router.get('/mie/:userId', async (req, res) => {
    const { userId } = req.params
    try {
      const result = await pool.query(
        'SELECT event_id FROM participants WHERE user_id = $1',
        [userId]
      )
      res.json(result.rows.map(r => r.event_id))
    } catch (err) {
      console.error('Errore partecipazioni:', err)
      res.status(500).json({ error: 'Errore nel recupero partecipazioni' })
    }
  })
  
  router.get('/create/:userId', async (req, res) => {
    const { userId } = req.params
    try {
      const result = await pool.query(`
        SELECT e.*, u.username AS organizer_name
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.organizer_id = $1
        ORDER BY e.date_time DESC
      `, [userId])
      res.json(result.rows)
    } catch (err) {
      console.error('Errore nel recupero partite create:', err)
      res.status(500).json({ error: 'Errore recupero partite create' })
    }
  })
  
  
  router.get('/iscritto/:userId', async (req, res) => {
    const { userId } = req.params
    try {
      const result = await pool.query(`
        SELECT e.*, u.username AS organizer_name
        FROM participants p
        JOIN events e ON p.event_id = e.id
        JOIN users u ON e.organizer_id = u.id
        WHERE p.user_id = $1 AND e.date_time >= NOW()
        AND e.organizer_id <> $1   -- escludi gli eventi creati da me
        ORDER BY e.date_time ASC
      `, [userId])
      res.json(result.rows)
    } catch (err) {
      console.error('Errore nel recupero partite iscritte:', err)
      res.status(500).json({ error: 'Errore recupero partite iscritte' })
    }
  })
  
  router.get('/storico/:userId', async (req, res) => {
    const { userId } = req.params
    try {
      const result = await pool.query(`
        SELECT e.*, u.username AS organizer_name
        FROM participants p
        JOIN events e ON p.event_id = e.id
        JOIN users u ON e.organizer_id = u.id
        WHERE p.user_id = $1 AND e.date_time < NOW()
        ORDER BY e.date_time DESC
      `, [userId])
      res.json(result.rows)
    } catch (err) {
      console.error('Errore nel recupero storico partite:', err)
      res.status(500).json({ error: 'Errore recupero storico partite' })
    }
  })
  
  module.exports = router;