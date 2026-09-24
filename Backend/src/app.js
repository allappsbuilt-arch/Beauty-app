const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const routinesRoutes = require('./routes/routines.routes');
const checkinsRoutes = require('./routes/checkins.routes');
const scansRoutes = require('./routes/scans.routes');
const pointsRoutes = require('./routes/points.routes');
const settingsRoutes = require('./routes/settings.routes');
const coachRoutes = require('./routes/coach.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const weeklyReportRoutes = require('./routes/weeklyReport.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/routines', routinesRoutes);
app.use('/api/checkins', checkinsRoutes);
app.use('/api/scans', scansRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/weekly-report', weeklyReportRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
