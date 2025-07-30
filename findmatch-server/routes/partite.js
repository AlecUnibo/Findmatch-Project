const express = require('express')
const router = express.Router()
const pool = require('../db')

//funzione GET per le partite inserite
router.get('/', async (req, res) => {
  try {
    const { termine, data, ora } = req.query

    let query = `
      SELECT e.*, u.username AS organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE 1=1
    `
    let values = []
    let counter = 1

    if (termine) {
      query += ` AND (LOWER(e.sport) LIKE $${counter} OR LOWER(e.location) LIKE $${counter})`
      values.push(`%${termine.toLowerCase()}%`)
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

module.exports = router
