const express = require('express')
const router = express.Router()
const pool = require('../db')

// Endpoint: GET /api/users/search?query=...
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

module.exports = router
