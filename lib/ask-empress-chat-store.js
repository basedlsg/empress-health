'use strict';

const { normaliseHistory } = require('./ask-empress-history');

function createChatStore(getPool) {
  let ready;
  async function db() {
    const pool = getPool();
    if (!pool) throw new Error('Chat history database unavailable');
    if (!ready) {
      ready = pool.query(`CREATE TABLE IF NOT EXISTS ask_empress_chats (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        exchanges JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`).catch(error => { ready = null; throw error; });
    }
    await ready;
    return pool;
  }
  return {
    async read(userId) {
      const pool = await db();
      const result = await pool.query(`SELECT exchanges FROM ask_empress_chats
        WHERE user_id = $1 AND updated_at > NOW() - INTERVAL '30 days'`, [userId]);
      const row = result.rows[0];
      return { remember: Boolean(row), history: normaliseHistory(row?.exchanges) };
    },
    async write(userId, remember, history) {
      const pool = await db();
      if (!remember) {
        await pool.query('DELETE FROM ask_empress_chats WHERE user_id = $1', [userId]);
        return;
      }
      await pool.query(`INSERT INTO ask_empress_chats (user_id, exchanges, updated_at)
        VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (user_id)
        DO UPDATE SET exchanges = EXCLUDED.exchanges, updated_at = NOW()`,
      [userId, JSON.stringify(normaliseHistory(history))]);
    },
  };
}

module.exports = { createChatStore };
