const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /api/partite?termine=&data=&ora=
router.get('/', async (req, res) => {
  try {
    const { termine, data, ora } = req.query

    let query = 'SELECT * FROM events WHERE 1=1'
    let values = []

    if (termine) {
      query += ` AND (LOWER(sport) LIKE $${values.length + 1} OR LOWER(location) LIKE $${values.length + 1})`
      values.push(`%${termine.toLowerCase()}%`)
    }

    if (data) {
      query += ` AND date_time::date = $${values.length + 1}`
      values.push(data)
    }

    if (ora) {
      query += ` AND date_time::time >= $${values.length + 1}`
      values.push(ora)
    }

    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error('Errore nel recupero partite:', error)
    res.status(500).json({ error: 'Errore nel recupero partite' })
  }
})

module.exports = router
