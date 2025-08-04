const express = require('express')
const router = express.Router()
const pool = require('../db')

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
<<<<<<< HEAD
      values.push(`%${sport.toLowerCase()}%`)
=======
      values.push('%${sport.toLowerCase()}%')
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
      counter++
    }

    if (luogo) {
      query += ` AND LOWER(e.location) LIKE $${counter}`
<<<<<<< HEAD
      values.push(`%${luogo.toLowerCase()}%`)
=======
      values.push('%${luogo.toLowerCase()}%')
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
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
  try {
    const { sport, location, date_time, max_players, description, organizer_id } = req.body

    const query = `
      INSERT INTO events (sport, location, date_time, max_players, description, organizer_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `

    const values = [sport, location, date_time, max_players, description, organizer_id]
    const result = await pool.query(query, values)

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Errore nella creazione della partita:', err)
    res.status(500).json({ error: 'Errore nella creazione della partita' })
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

<<<<<<< HEAD
module.exports = router
=======
module.exports = router
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
