const express = require('express');
const app = express();
const port = 3001;

var mysql = require('mysql');
var connection  = require('./lib/db');

// Routes
var indexRouter = require('./routes/index');

app.use('/', indexRouter);

module.exports = app;