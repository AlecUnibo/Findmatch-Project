const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const partecipazioniRoutes = require('./routes/partecipazioni')
const partiteRoutes = require('./routes/partite')
const usersRoutes = require('./routes/users')

const app = express()

app.use(cors()) // ✅ Deve essere PRIMA di TUTTE le rotte
app.use(express.json())

// Rotte API
app.use('/api/users', usersRoutes)
app.use('/api/partecipazioni', partecipazioniRoutes)
app.use('/api', authRoutes)
app.use('/api/partite', partiteRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`)
})
