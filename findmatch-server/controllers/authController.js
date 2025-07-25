const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db')

const register = async (req, res) => {
  const { name, email, password } = req.body
  try {
    const hashed = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      [name, email, hashed]
    )
    res.status(201).json({ message: 'Utente registrato con successo' })
  } catch (err) {
    console.error('ERRORE REGISTRAZIONE:', err)  // 👈 DEBUG
    res.status(500).json({ error: 'Errore registrazione' })
  }
}


const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(400).json({ error: 'Email non trovata' })

    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Password errata' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
    res.json({ token, user: { id: user.id, name: user.name } })
  } catch (err) {
    res.status(500).json({ error: 'Errore login' })
  }
}

module.exports = { register, login }
