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

//funzione GET per le partite inserite
router.get('/', async (req, res) => {
  try {
    const { sport, luogo, data, ora } = req.query
    let query = `
      SELECT
        e.*,
        u.username AS organizer_name,
        COUNT(p.user_id) AS partecipanti
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN participants p ON e.id = p.event_id
      WHERE 1=1
    `
    let values = []
    let counter = 1
    if (sport) {
      query += ` AND LOWER(e.sport) LIKE $${counter}`
      values.push(`%${sport.toLowerCase()}%`)
      counter++
    }
    if (luogo) {
      query += ` AND LOWER(e.location) LIKE $${counter}`
      values.push(`%${luogo.toLowerCase()}%`)
      counter++
    }
    if (data) {
      query += ` AND e.date_time::date = $${counter}`
      values.push(data)
      counter++
    }
    if (ora) {
      query += ` AND e.date_time::time >= $${counter}`
      values.push(ora)
      counter++
    }
    query += ` GROUP BY e.id, u.username`
    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error('Errore nel recupero partite:', error)
    res.status(500).json({ error: 'Errore nel recupero partite' })
  }
})

router.post('/', async (req, res) => {
  const { sport, location, date_time, max_players, description, organizer_id } = req.body;
  try {
    await pool.query('BEGIN');

    const query = `
      INSERT INTO events (sport, location, date_time, max_players, description, organizer_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [sport, location, date_time, max_players, description, organizer_id];
    const result = await pool.query(query, values);
    const newEvent = result.rows[0];

    await pool.query(
      'INSERT INTO participants (user_id, event_id) VALUES ($1, $2)',
      [organizer_id, newEvent.id]
    );

    // Notifica ai follower
    try {
        const organizerRes = await pool.query('SELECT username FROM users WHERE id = $1', [organizer_id]);
        const organizerUsername = organizerRes.rows[0]?.username || 'Un utente';
        const followersRes = await pool.query('SELECT follower_id FROM followers WHERE user_id = $1', [organizer_id]);
        const followers = followersRes.rows;
        const formattedDateTime = formatDateTime(newEvent.date_time);
        const message = `${organizerUsername} ha creato una partita di ${sport} per il ${formattedDateTime} a ${newEvent.location}. Unisciti!`;

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
})

// Aggiorna partita esistente
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { sport, location, date_time, max_players, description } = req.body
  try {
    const result = await pool.query(
      `UPDATE events
       SET sport = $1, location = $2, date_time = $3, max_players = $4, description = $5
       WHERE id = $6
       RETURNING *`,
      [sport, location, date_time, max_players, description, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partita non trovata' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Errore durante aggiornamento partita:', err)
    res.status(500).json({ error: 'Errore durante aggiornamento partita' })
  }
})

// Elimina una partita e notifica i partecipanti
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

    const eventRes = await pool.query('SELECT sport, date_time, location FROM events WHERE id = $1', [id]);
    const eventDetails = eventRes.rows.length > 0 ? eventRes.rows[0] : null;
    
    const deleteResult = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Partita non trovata o già eliminata' });
    }

    if (eventDetails) {
        const formattedDateTime = formatDateTime(eventDetails.date_time);
        const message = `La partita di ${eventDetails.sport} del ${formattedDateTime} a ${eventDetails.location} è stata annullata dall'organizzatore.`;
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

// POST /api/partite/:id/invite - Invia un invito a un utente
router.post('/:id/invite', async (req, res) => {
  const { id: eventId } = req.params;
  const { inviterId, inviteeId } = req.body; // ID di chi invita, ID di chi è invitato

  if (!inviterId || !inviteeId) {
    return res.status(400).json({ error: 'ID mancanti per l\'invito.' });
  }
  if (inviterId === inviteeId) {
    return res.status(400).json({ error: 'Non puoi invitare te stesso.' });
  }

  try {
    // Recupera i dettagli per il messaggio
    const eventRes = await pool.query('SELECT sport, date_time, location FROM events WHERE id = $1', [eventId]);
    const inviterRes = await pool.query('SELECT username FROM users WHERE id = $1', [inviterId]);

    if (eventRes.rows.length === 0 || inviterRes.rows.length === 0) {
      return res.status(404).json({ error: 'Partita o utente non trovato.' });
    }

    const { sport, date_time, location } = eventRes.rows[0];
    const { username: inviterUsername } = inviterRes.rows[0];
    const d = new Date(date_time);
    const formattedDateTime = `${d.toLocaleDateString('it-IT')} alle ${d.toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}`;

    // Crea la notifica
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

// GET /api/partite/:id - Recupera i dettagli di una singola partita
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