const express = require('express');
const cors = require('cors');
const { HttpError } = require('./utils/httpError');
const { clientDateMiddleware } = require('./services/date.util');
const authRoutes = require('./routes/auth.routes');
const routinesRoutes = require('./routes/routines.routes');
const checkinsRoutes = require('./routes/checkins.routes');
const scansRoutes = require('./routes/scans.routes');
const pointsRoutes = require('./routes/points.routes');
const settingsRoutes = require('./routes/settings.routes');
const coachRoutes = require('./routes/coach.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const weeklyReportRoutes = require('./routes/weeklyReport.routes');
const makeupRoutes = require('./routes/makeup.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const trackersRoutes = require('./routes/trackers.routes');
const productsRoutes = require('./routes/products.routes');
const accountRoutes = require('./routes/account.routes');
const stylesRoutes = require('./routes/styles.routes');
const visualizersRoutes = require('./routes/visualizers.routes');

const app = express();

app.use(cors());
// Photos are sent as base64, so allow larger bodies than the 100kb default.
app.use(express.json({ limit: '10mb' }));
app.use(clientDateMiddleware);

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
app.use('/api/makeup', makeupRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/trackers', trackersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/styles', stylesRoutes);
app.use('/api/visualizers', visualizersRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Photo is too large — please use a smaller image' });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
