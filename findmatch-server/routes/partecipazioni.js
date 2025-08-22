const express = require('express');
const router = express.Router();
const pool = require('../db');

// Aggiungi partecipazione
router.post('/', async (req, res) => {
  const { user_id, event_id } = req.body;
  try {
    // Inserisce il partecipante
    await pool.query(
      'INSERT INTO participants (user_id, event_id) VALUES ($1, $2)',
      [user_id, event_id]
    );

    // --- BLOCCO NOTIFICA: UTENTE SI È UNITO ---
    try {
      const eventRes = await pool.query('SELECT organizer_id, sport FROM events WHERE id = $1', [event_id]);
      if (eventRes.rows.length > 0) {
        const { organizer_id, sport } = eventRes.rows[0];
        if (String(organizer_id) !== String(user_id)) {
          const actorRes = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
          const actorUsername = actorRes.rows[0]?.username || 'Qualcuno';
          await pool.query(
            `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
             VALUES ($1, $2, $3, 'partita_unito', $4)`,
            [organizer_id, user_id, event_id, `${actorUsername} si è unito alla tua partita di ${sport}.`]
          );
        }
      }
    } catch (notificationError) {
      console.error('Errore (non bloccante) durante la creazione della notifica di join:', notificationError);
    }
    // --- FINE BLOCCO NOTIFICA ---

    res.status(201).json({ message: 'Partecipazione registrata' });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Sei già iscritto a questa partita.' });
    }
    console.error('Errore partecipazione:', err);
    res.status(500).json({ error: 'Errore durante la registrazione alla partita' });
  }
});

// Rimuovi partecipazione
router.delete('/', async (req, res) => {
    const { user_id, event_id } = req.body;
    try {
        // 1. Rimuove il partecipante
        await pool.query(
            'DELETE FROM participants WHERE user_id = $1 AND event_id = $2',
            [user_id, event_id]
        );

        // --- BLOCCO NOTIFICA: UTENTE HA ABBANDONATO ---
        try {
            const eventRes = await pool.query('SELECT organizer_id, sport FROM events WHERE id = $1', [event_id]);
            if (eventRes.rows.length > 0) {
                const { organizer_id, sport } = eventRes.rows[0];
                if (String(organizer_id) !== String(user_id)) {
                    const actorRes = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
                    const actorUsername = actorRes.rows[0]?.username || 'Qualcuno';
                    await pool.query(
                        `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
                         VALUES ($1, $2, $3, 'partita_abbandonata', $4)`,
                        [organizer_id, user_id, event_id, `${actorUsername} ha abbandonato la tua partita di ${sport}.`]
                    );
                }
            }
        } catch (notificationError) {
            console.error('Errore (non bloccante) durante la creazione della notifica di abbandono:', notificationError);
        }
        // --- FINE BLOCCO NOTIFICA ---

        res.json({ message: 'Partecipazione rimossa con successo' });
    } catch (err) {
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