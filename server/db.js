const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'wallpay.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS wallpapers (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT,
    coins INTEGER DEFAULT 10,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    wallpaper_id TEXT NOT NULL,
    coins INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_rewards_device ON rewards(device_id);
  CREATE INDEX IF NOT EXISTS idx_rewards_wallpaper ON rewards(wallpaper_id);
`);

// Prepared statements
const queries = {
  // Wallpapers
  getAllWallpapers: db.prepare('SELECT * FROM wallpapers ORDER BY created_at DESC'),
  getActiveWallpapers: db.prepare('SELECT * FROM wallpapers WHERE is_active = 1 ORDER BY created_at DESC'),
  getWallpaperById: db.prepare('SELECT * FROM wallpapers WHERE id = ?'),
  insertWallpaper: db.prepare('INSERT INTO wallpapers (id, filename, original_name, coins) VALUES (?, ?, ?, ?)'),
  updateWallpaper: db.prepare('UPDATE wallpapers SET coins = COALESCE(?, coins), is_active = COALESCE(?, is_active) WHERE id = ?'),
  deleteWallpaper: db.prepare('DELETE FROM wallpapers WHERE id = ?'),

  // Rewards
  insertReward: db.prepare('INSERT INTO rewards (device_id, wallpaper_id, coins) VALUES (?, ?, ?)'),
  getTotalCoins: db.prepare('SELECT COALESCE(SUM(coins), 0) as total FROM rewards WHERE device_id = ?'),
  getRewardHistory: db.prepare('SELECT r.*, w.original_name as wallpaper_name FROM rewards r LEFT JOIN wallpapers w ON r.wallpaper_id = w.id WHERE r.device_id = ? ORDER BY r.created_at DESC LIMIT 50'),
  checkRewardExists: db.prepare('SELECT COUNT(*) as count FROM rewards WHERE device_id = ? AND wallpaper_id = ?'),
};

module.exports = { db, queries };
