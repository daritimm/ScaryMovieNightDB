'use strict'

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const movieRoutes = require('./routes/movies');
const methodOverride = require('method-override');
const MongoClient = require('mongodb').MongoClient;

dotenv.config({path: './config.env' });

let uri = process.env.DATABASE

// const client = new MongoClient(uri, { 
//     useNewUrlParser: true, 
//     useUnifiedTopology: true,
//     auth: {
//         user: process.env.MONGO_USER,
//         password: process.env.MONGO_PWD
//     } });

// client.connect(err => {
//     const collection = client.db("ScaryMovieNight").collection("movies");
//     console.log("collection" + collection)
//     console.log("error:" + err);
//     client.close(); 
//   });
  

mongoose.connect(uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false 
});

mongoose.connection.on('error', err => {
    console.log('connection:' + connection)
    console.log('error:' + err);
  });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use(movieRoutes);


app.listen(process.env.PORT || 3000, () => {
    console.log('Server has started on Port ' + process.env.PORT);
})