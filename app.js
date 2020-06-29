const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const movieRoutes = require('./routes/movies');
const methodOverride = require('method-override');
const multer = require('multer');


mongoose.connect('mongodb+srv://daritimm:VrGuv3DSJcXQ8FQ@cluster0-sya2h.mongodb.net/ScaryMovieNightretryWrites=true&w=majority', {
// mongoose.connect('mongodb://localhost:27017/ScaryMovieNight', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false 
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

dotenv.config({path: '/.config.env' });



app.use(movieRoutes);



app.listen(process.env.PORT || 3000, () => {
    console.log('Server has started on Port 3000');
})