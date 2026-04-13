const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const wardrobeRoutes = require('./routes/wardrobeRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfit', outfitRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
