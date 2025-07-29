// index.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', authRoutes)

const partiteRoutes = require('./routes/partite')
app.use('/api/partite', partiteRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`)
})