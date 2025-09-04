const cron = require('node-cron');
const pool = require('./db');

// Funzione helper per formattare la data e l'ora nei messaggi
const formatDateTime = (dateTime) => {
  const d = new Date(dateTime);
  const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${date} alle ${time}`;
};

// Eseguito ogni ora, al minuto 0 (es. 13:00, 14:00)
cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toLocaleString()}] Esecuzione cron job per promemoria a 24 ORE...`);
  try {
    // Seleziona le partite che iniziano tra 24 e 25 ore da adesso
    const { rows: events } = await pool.query(`
      SELECT id, sport, date_time, location
      FROM events
      WHERE date_time BETWEEN NOW() + interval '24 hours' AND NOW() + interval '25 hours'
    `);

    if (events.length > 0) {
      for (const event of events) {
        const { rows: participants } = await pool.query('SELECT user_id FROM participants WHERE event_id = $1', [event.id]);
        if (participants.length > 0) {
          const message = `PROMEMORIA: La tua partita di ${event.sport} è domani! Appuntamento per il ${formatDateTime(event.date_time)} a ${event.location}.`;
          for (const p of participants) {
            await pool.query(
              `INSERT INTO notifications (user_id, event_id, type, message) VALUES ($1, $2, 'promemoria_partita', $3)`,
              [p.user_id, event.id, message]
            );
          }
          console.log(`Inviati ${participants.length} promemoria (24h) per la partita ID ${event.id}`);
        }
      }
    }
  } catch (err) {
    console.error('Errore durante il cron job dei promemoria a 24 ore:', err);
  }
});

// Eseguito ogni 5 minuti, per non mancare la finestra esatta
cron.schedule('*/5 * * * *', async () => {
    console.log(`[${new Date().toLocaleString()}] Esecuzione cron job per promemoria a 1 ORA...`);
    try {
      // Seleziona le partite che iniziano tra 60 e 65 minuti da adesso
      const { rows: events } = await pool.query(`
        SELECT id, sport, date_time, location
        FROM events
        WHERE date_time BETWEEN NOW() + interval '60 minutes' AND NOW() + interval '65 minutes'
      `);
  
      if (events.length > 0) {
        for (const event of events) {
          const { rows: participants } = await pool.query('SELECT user_id FROM participants WHERE event_id = $1', [event.id]);
          if (participants.length > 0) {
            const message = `🔥 Manca poco! La tua partita di ${event.sport} inizia tra un'ora a ${event.location}.`;
            for (const p of participants) {
              await pool.query(
                `INSERT INTO notifications (user_id, event_id, type, message) VALUES ($1, $2, 'promemoria_partita', $3)`,
                [p.user_id, event.id, message]
              );
            }
            console.log(`Inviati ${participants.length} promemoria (1h) per la partita ID ${event.id}`);
          }
        }
      }
    } catch (err) {
      console.error('Errore durante il cron job dei promemoria a 1 ora:', err);
    }
  });

console.log('Cron job per i promemoria delle partite inizializzato.');