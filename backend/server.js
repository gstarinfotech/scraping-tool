require('dotenv').config();
const express = require('express');
const cors = require('cors');

const belkRouter = require('./routes/belk');
const syncRouter = require('./routes/sync');
const creditsRouter = require('./routes/credits');
const boscovRouter = require('./routes/boscov');
const walmartRoute = require('./routes/walmart');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/belk', belkRouter);
app.use('/api/belk', syncRouter);
app.use('/api/belk', creditsRouter);
app.use('/api/boscov', boscovRouter);
app.use('/api/walmart', walmartRoute);

app.get('/', (req, res) => {
    res.send('Scraper API running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});