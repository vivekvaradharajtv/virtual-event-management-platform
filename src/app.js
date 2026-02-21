const express = require('express');
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const { errorHandler } = require('./errors');

const app = express();

app.use(express.json());

app.use(authRoutes);
app.use('/events', eventsRoutes);

app.use(errorHandler);

module.exports = app;
