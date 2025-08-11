const express = require('express')
const router = express.Router()
const pool = require('../db')
const bcrypt = require('bcrypt');


// Rotta per cercare utenti dalla NavBar
router.get('/search', async (req, res) => {
  const { query } = req.query
  if (!query) return res.json([])

  try {
    const result = await pool.query(
      `SELECT id, username FROM users WHERE LOWER(username) LIKE LOWER($1) LIMIT 10`,
      [`%${query}%`]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Errore ricerca utenti:', err)
    res.status(500).json({ error: 'Errore ricerca utenti' })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const viewerId = req.query.viewerId; // opzionale, per is_following

  try {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.bio,
        -- conteggio follower live
        (SELECT COUNT(*) FROM followers f WHERE f.user_id = u.id) AS followers_count,
        -- partite giocate: partecipazioni a eventi già passati
        COALESCE((
          SELECT COUNT(DISTINCT p.event_id)
          FROM participants p 
          JOIN events e ON e.id = p.event_id
          WHERE p.user_id = u.id
            AND e.date_time < NOW()
        ), 0) AS matches_played,
        -- facoltativo: se il viewer segue già questo utente
        CASE 
          WHEN $2::int IS NULL THEN false
          ELSE EXISTS(
            SELECT 1 FROM followers f2 
            WHERE f2.user_id = u.id AND f2.follower_id = $2::int
          )
        END AS is_following
      FROM users u
      WHERE u.id = $1
      `,
      [id, viewerId || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore nel recupero utente:', err);
    res.status(500).json({ error: 'Errore nel recupero utente' });
  }
})

// Rotta per cambiare la pw dalle impostazioni
router.put('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body
  console.log("🛠️ Dati ricevuti:", { userId, currentPassword, newPassword })

  try {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    const passwordHash = result.rows[0].password_hash
    console.log("Password hash dal DB:", passwordHash)

    const match = await bcrypt.compare(currentPassword, passwordHash)

    if (!match) {
      return res.status(401).json({ error: 'Password attuale errata' })
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHashedPassword, userId]
    )

    res.json({ message: 'Password aggiornata con successo' })
  } catch (err) {
    console.error('Errore durante il cambio password:', err)
    res.status(500).json({ error: 'Errore durante il cambio password' })
  }
})

// Rotta per eliminare l'account dalle impostazioni
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ message: 'Account eliminato con successo' });
  } catch (err) {
    console.error('Errore durante eliminazione utente:', err);
    res.status(500).json({ error: 'Errore durante eliminazione account' });
  }
})

// Rotta per aggiornare la bio
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { bio } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, username, email, bio, followers_count`,
      [bio ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ message: 'Profilo aggiornato', user: result.rows[0] });
  } catch (err) {
    console.error('Errore aggiornamento profilo:', err);
    res.status(500).json({ error: 'Errore aggiornamento profilo' });
  }
});

// Segui un utente
router.post('/:id/follow', async (req, res) => {
  const { id } = req.params;               // user da seguire
  const { followerId } = req.body;         // chi sta seguendo (dal client)

  if (!followerId) return res.status(400).json({ error: 'followerId obbligatorio' });
  if (parseInt(id) === parseInt(followerId)) {
    return res.status(400).json({ error: 'Non puoi seguire te stesso' });
  }

  try {
    await pool.query(
      `INSERT INTO followers (user_id, follower_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, follower_id) DO NOTHING`,
      [id, followerId]
    );
    // ritorniamo il nuovo totale follower
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS followers_count FROM followers WHERE user_id = $1`,
      [id]
    );
    res.json({ followed: true, followers_count: countRes.rows[0].followers_count });
  } catch (err) {
    console.error('Errore follow:', err);
    res.status(500).json({ error: 'Errore follow' });
  }
});

// Smetti di seguire
router.delete('/:id/follow', async (req, res) => {
  const { id } = req.params;          // user da smettere di seguire
  const { followerId } = req.body;    // chi sta smettendo (dal client)

  if (!followerId) return res.status(400).json({ error: 'followerId obbligatorio' });

  try {
    await pool.query(
      `DELETE FROM followers WHERE user_id = $1 AND follower_id = $2`,
      [id, followerId]
    );
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS followers_count FROM followers WHERE user_id = $1`,
      [id]
    );
    res.json({ unfollowed: true, followers_count: countRes.rows[0].followers_count });
  } catch (err) {
    console.error('Errore unfollow:', err);
    res.status(500).json({ error: 'Errore unfollow' });
  }
});

// GET /api/users/:id/played
router.get('/:id/played', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `
      SELECT
        e.id,
        e.sport,
        e.location,
        e.date_time,
        e.max_players,
        e.description,
        e.organizer_id
      FROM participants p
      JOIN events e ON e.id = p.event_id
      WHERE p.user_id = $1
        AND e.date_time < NOW()
      ORDER BY e.date_time DESC
      `,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Errore nel recupero partite giocate:', err);
    res.status(500).json({ error: 'Errore nel recupero partite giocate' });
  }
});


module.exports = router
