const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/notifiche/:userId - Recupera le notifiche per un utente
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT
         n.id,
         n.user_id,
         n.actor_id,
         n.event_id,
         n.type,
         n.message,
         n.is_read,
         n.created_at::text,
         u.username AS actor_username
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Errore nel recupero notifiche:', err);
    res.status(500).json({ error: 'Errore nel recupero delle notifiche' });
  }
});

// Conteggio notifiche non lette
router.get('/unread-count/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    res.json({ count: parseInt(rows[0].count, 10) });
  } catch (err) {
    console.error('Errore nel conteggio notifiche non lette:', err);
    res.status(500).json({ error: 'Errore nel conteggio delle notifiche non lette' });
  }
});

// Segna TUTTE le notifiche come lette
router.post('/mark-all-as-read/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    res.json({ message: 'Tutte le notifiche segnate come lette' });
  } catch (err) {
    console.error('Errore nell\'aggiornamento delle notifiche:', err);
    res.status(500).json({ error: 'Errore nell\'aggiornamento delle notifiche' });
  }
});

// Segna UNA notifica come letta
router.put('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notifica non trovata o non autorizzato' });
    }
    res.status(200).json({ message: 'Notifica segnata come letta' });
  } catch (err) {
    console.error('Errore nel segnare notifica come letta:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// Elimina UNA notifica
router.delete('/:notificationId', async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.body;
  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notifica non trovata o non autorizzato' });
    }
    res.status(200).json({ message: 'Notifica eliminata' });
  } catch (err) {
    console.error('Errore eliminazione notifica:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

module.exports = router;