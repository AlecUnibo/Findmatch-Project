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

// Aggiungi partecipazione
router.post('/', async (req, res) => {
  const { user_id, event_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO participants (user_id, event_id) VALUES ($1, $2)',
      [user_id, event_id]
    );

    const eventRes = await pool.query('SELECT organizer_id, sport, max_players, date_time, location FROM events WHERE id = $1', [event_id]);
    if (eventRes.rows.length > 0) {
      const { organizer_id, sport, max_players, date_time, location } = eventRes.rows[0];
      const formattedDateTime = formatDateTime(date_time);

      // Notifica per l'organizzatore quando un utente si unisce
      if (String(organizer_id) !== String(user_id)) {
        const actorRes = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
        const actorUsername = actorRes.rows[0]?.username || 'Qualcuno';
        const message = `${actorUsername} si è unito alla tua partita di ${sport} del ${formattedDateTime} a ${location}.`;
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
           VALUES ($1, $2, $3, 'partita_unito', $4)`,
          [organizer_id, user_id, event_id, message]
        );
      }

      // Notifica quando la partita è al completo
      const participantsCountRes = await pool.query('SELECT COUNT(*) FROM participants WHERE event_id = $1', [event_id]);
      const currentParticipants = parseInt(participantsCountRes.rows[0].count, 10);

      if (currentParticipants === max_players) {
        const message = `La tua partita di ${sport} del ${formattedDateTime} a ${location} è al completo!`;
        await pool.query(
          `INSERT INTO notifications (user_id, event_id, type, message)
           VALUES ($1, $2, 'partita_completa', $3)`,
          [organizer_id, event_id, message]
        );
      }
    }

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
        await pool.query(
            'DELETE FROM participants WHERE user_id = $1 AND event_id = $2',
            [user_id, event_id]
        );

        const eventRes = await pool.query('SELECT organizer_id, sport, date_time, location FROM events WHERE id = $1', [event_id]);
        if (eventRes.rows.length > 0) {
            const { organizer_id, sport, date_time, location } = eventRes.rows[0];
            const formattedDateTime = formatDateTime(date_time);

            if (String(organizer_id) !== String(user_id)) {
                const actorRes = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
                const actorUsername = actorRes.rows[0]?.username || 'Qualcuno';
                const message = `${actorUsername} ha abbandonato la tua partita di ${sport} del ${formattedDateTime} a ${location}.`;
                await pool.query(
                    `INSERT INTO notifications (user_id, actor_id, event_id, type, message)
                     VALUES ($1, $2, $3, 'partita_abbandonata', $4)`,
                    [organizer_id, user_id, event_id, message]
                );
            }
        }

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