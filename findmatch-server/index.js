const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const partecipazioniRoutes = require('./routes/partecipazioni')
const partiteRoutes = require('./routes/partite')
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/partecipazioni', partecipazioniRoutes)
app.use('/api', authRoutes)
app.use('/api/partite', partiteRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Server in ascolto sulla porta ${PORT}')
})