const express = require('express');
const app = express();
// Load model plugins
require('./models/register-plugins');

// MIDDLEWARE
const morgan = require('morgan');
const checkConnection = require('./middleware/check-connection');
app.use(morgan('dev'));
app.use(checkConnection);
// Body Parser
app.use(express.json());

// IS ALIVE TEST
app.get('/hello', (req, res) => res.send('world'));

// API ROUTES
const auth = require('./routes/auth');
app.use('/api/auth', auth);

// NOT FOUND
const api404 = require('./middleware/api-404');
app.use('/api', api404);
// using express default 404 for non-api routes

// ERRORS
const errorHandler = require('./middleware/error-handler');
app.use(errorHandler);

module.exports = app;