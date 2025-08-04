const express = require('express')
const router = express.Router()
const pool = require('../db')

// Aggiungi partecipazione
router.post('/', async (req, res) => {
  const { user_id, event_id } = req.body
  try {
    await pool.query(
      'INSERT INTO participants (user_id, event_id) VALUES ($1, $2)',
      [user_id, event_id]
    )
    res.status(201).json({ message: 'Partecipazione registrata' })
  } catch (err) {
    if (err.code === '23505') {
      // 23505 = unique_violation
      return res.status(409).json({ error: 'Sei già iscritto a questa partita.' })
    }

    console.error('Errore partecipazione:', err)
    res.status(500).json({ error: 'Errore durante la registrazione alla partita' })
  }
})

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


// Rimuovi partecipazione
router.delete('/', async (req, res) => {
  const { user_id, event_id } = req.body

  try {
    await pool.query(
      'DELETE FROM participants WHERE user_id = $1 AND event_id = $2',
      [user_id, event_id]
    )
    res.json({ message: 'Partecipazione rimossa con successo' })
  } catch (err) {
    console.error('Errore rimozione partecipazione:', err)
    res.status(500).json({ error: 'Errore durante la rimozione della partecipazione' })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partita non trovata o già eliminata' })
    }

    res.json({ message: 'Partita eliminata con successo' })
  } catch (err) {
    console.error('Errore durante eliminazione partita:', err)
    res.status(500).json({ error: 'Errore durante eliminazione partita' })
  }
})


module.exports = router


module.exports = router
