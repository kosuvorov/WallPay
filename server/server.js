const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { queries, db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files
app.use('/uploads', express.static(uploadsDir));
app.use('/', express.static(path.join(__dirname, 'public')));

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|heic/;
        const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = allowed.test(file.mimetype) || file.mimetype === 'image/heic';
        if (extOk || mimeOk) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    },
});

// ─── API Routes ────────────────────────────────────────────────

// GET /api/wallpapers — active wallpapers for iOS app
app.get('/api/wallpapers', (req, res) => {
    try {
        const wallpapers = queries.getActiveWallpapers.all();
        const mapped = wallpapers.map((w) => ({
            ...w,
            image_url: `/uploads/${w.filename}`,
            is_active: Boolean(w.is_active),
        }));
        res.json({ wallpapers: mapped });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/wallpapers/all — all wallpapers for admin
app.get('/api/wallpapers/all', (req, res) => {
    try {
        const wallpapers = queries.getAllWallpapers.all();
        const mapped = wallpapers.map((w) => ({
            ...w,
            image_url: `/uploads/${w.filename}`,
            is_active: Boolean(w.is_active),
        }));
        res.json({ wallpapers: mapped });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/wallpapers — upload new wallpaper
app.post('/api/wallpapers', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const id = uuidv4();
        const coins = parseInt(req.body.coins) || 10;
        const originalName = req.file.originalname;

        queries.insertWallpaper.run(id, req.file.filename, originalName, coins);

        const wallpaper = queries.getWallpaperById.get(id);
        res.status(201).json({
            ...wallpaper,
            image_url: `/uploads/${wallpaper.filename}`,
            is_active: Boolean(wallpaper.is_active),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/wallpapers/:id — update wallpaper
app.patch('/api/wallpapers/:id', (req, res) => {
    try {
        const { id } = req.params;
        const wallpaper = queries.getWallpaperById.get(id);
        if (!wallpaper) {
            return res.status(404).json({ error: 'Wallpaper not found' });
        }

        const coins = req.body.coins !== undefined ? parseInt(req.body.coins) : null;
        const isActive = req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : null;

        queries.updateWallpaper.run(coins, isActive, id);

        const updated = queries.getWallpaperById.get(id);
        res.json({
            ...updated,
            image_url: `/uploads/${updated.filename}`,
            is_active: Boolean(updated.is_active),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/wallpapers/:id
app.delete('/api/wallpapers/:id', (req, res) => {
    try {
        const { id } = req.params;
        const wallpaper = queries.getWallpaperById.get(id);
        if (!wallpaper) {
            return res.status(404).json({ error: 'Wallpaper not found' });
        }

        // Delete file
        const filePath = path.join(uploadsDir, wallpaper.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        queries.deleteWallpaper.run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/rewards — claim reward for setting a wallpaper
app.post('/api/rewards', (req, res) => {
    try {
        const { deviceId, wallpaperId } = req.body;
        if (!deviceId || !wallpaperId) {
            return res.status(400).json({ error: 'deviceId and wallpaperId are required' });
        }

        const wallpaper = queries.getWallpaperById.get(wallpaperId);
        if (!wallpaper) {
            return res.status(404).json({ error: 'Wallpaper not found' });
        }

        // Check if already claimed
        const existing = queries.checkRewardExists.get(deviceId, wallpaperId);
        if (existing.count > 0) {
            const total = queries.getTotalCoins.get(deviceId);
            return res.json({
                already_claimed: true,
                coins_earned: 0,
                total_coins: total.total,
            });
        }

        queries.insertReward.run(deviceId, wallpaperId, wallpaper.coins);
        const total = queries.getTotalCoins.get(deviceId);

        res.status(201).json({
            already_claimed: false,
            coins_earned: wallpaper.coins,
            total_coins: total.total,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/rewards/:deviceId — get reward info
app.get('/api/rewards/:deviceId', (req, res) => {
    try {
        const { deviceId } = req.params;
        const total = queries.getTotalCoins.get(deviceId);
        const history = queries.getRewardHistory.all(deviceId);

        res.json({
            device_id: deviceId,
            total_coins: total.total,
            history,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Start Server ──────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🚀 WallPay server running at http://localhost:${PORT}`);
    console.log(`📁 Admin panel:  http://localhost:${PORT}`);
    console.log(`📡 API base:     http://localhost:${PORT}/api`);
});
