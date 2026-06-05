require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const spotifyRoutes = require('./routes/spotify');

const app = express();
const PORT = process.env.PORT || 8888;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://stella-music.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/api', spotifyRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', name: 'Bloom Music API' }));

app.listen(PORT, () => {
  console.log(`🌸 Bloom Music Server running on port ${PORT}`);
});
