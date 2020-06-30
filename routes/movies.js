const express = require('express');
const app = express();
const path = require('path');
const request = require('request');

const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

let Schema = mongoose.Schema;

let movieSchema = new Schema({
    title: String,
    smn: String,
    rtc: String,
    mtc: String,
    imdb: String,
    comments: String,
    pictureUrl: String
    }, {
        bufferCommands: false,
        autoCreate: false
    });


let Movie = mongoose.model('Movie', movieSchema);
Movie.createCollection();

router.get('/movies/index', (req, res) => {

    Movie.find()
        .then(movies => {
            res.render('index', { movies: movies })
        })
        .catch(err => {
            res.status(500).send({error: "Movie.find error on get movies/index = " + err})
        })
});

router.get('/movies/new', (req, res) => {
    res.render('new');
});

router.post('/movies/new', (req, res) => {
    let newTitle = capitalizeWord(req.body.title)
    
    let newMovie = {
        title: newTitle,
        smn: req.body.smn,
        rtc: req.body.rtc,
        mtc: req.body.mtc,
        imdb: req.body.imdb,
        comments: req.body.comments
    };

    Movie.create(newMovie)
        .then(movie => {
            res.redirect('/movies/index')
        })
        .catch(err => {
            res.status(500).send({error: "Movie.create error on post movies/new = " + err})
        })
});


router.get('/movies/edit/:title', (req, res) => {
    let searchQuery = {
        title: req.params.title
    };

    Movie.findOne(searchQuery)
        .then(movies => {
            res.render('edit', {movies: movies})
        })
        .catch(err => {
            res.status(500).send({error: "Movie.findOne error on get movies/edit = " + err})
        });
});

router.put('/movies/edit/:title', (req, res) => {
    let query ={
        title: req.body.title
    }

    let update = {
        title: req.body.title,
        rtc: req.body.rtc,
        rta: req.body.rta,
        imdb: req.body.imdb
    };

    Movie.findOneAndUpate(query, update)
        .then(movie => {
            res.redirect('/movies')
        })
        .catch(err => {
            res.status(500).send({error: "Movie.findOneAndUpdate error on put movies/edit = " + err})
        });
});

router.get('/', (req, res) => {
    res.render('search', {movies: " "})
});

router.get('/movies', (req, res) => {
    res.render('search', {movies: " "})
});


function capitalizeWord(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

router.post('/movies/search', (req, res) => {
    let searchTitle = capitalizeWord(req.body.title);
    let searchYear = req.body.year;
    let requestURL = '';

    if(searchYear != ''){
        requestURL = 'http://www.omdbapi.com/?apikey=fdd65e82&t='+searchTitle+'&y='+searchYear;
    }
    else{
        requestURL = 'http://www.omdbapi.com/?apikey=fdd65e82&t='+searchTitle;
    }

    request(requestURL, (error, response, body) => {
        if(error) {
            console.log(error)
            res.redirect('search')
        };

        let data = JSON.parse(body);
        console.log("API data: " + data)

        let titleData, yearData, imdbData, rtcData, mtcData, runtimeData;

        if(!data.Title){
            titleData = 'N/A'
        } else {
            titleData = data.Title
        };

        if(!data.Year){
            yearData = 'N/A'
        } else {
            yearData = data.Year
        };

        // if(!data.Ratings){
        //     imdbData = 'N/A';
        //     rtcData = 'N/A';
        //     mtcData = 'N/A';
        // }

        if(!data.Ratings[0]){
            imdbData = 'N/A'
        } else {
            imdbData = data.Ratings[0].Value
        };

        if(!data.Ratings[1]){
            rtcData = 'N/A'
        } else {
            rtcData = data.Ratings[1].Value
        };

        if(!data.Ratings[2]){
            mtcData = 'N/A'
        } else {
            mtcData = data.Ratings[2].Value
        };

        if(!data.Runtime){
            runtimeData = 'N/A'
        } else {
            runtimeData = data.Runtime
        };

        let movie = {
            title: titleData,
            year: yearData,
            imdb: imdbData,
            rtc: rtcData,
            mtc: mtcData,   
            runtime: runtimeData
        }

        res.render('search', {movies: movie})

    });

    // let searchQuery = {
    //     title: searchTitle
    // };

    // Movie.findOne(searchQuery)
    //     .then(movie => {
    //         res.render('search', { movies: movie })
    //     })
    //     .catch(err => {
    //         res.status(500).send({error:err})
    //     });
});



router.post('/movies/delete/:id', (req, res) => {
    let query = {
        _id: req.params.id
    };

    Movie.findOneAndDelete(query)
        .then(movies => {
            res.redirect('/movies')
        })
        .catch(err => {
            res.status(500).send({error: "Movie.findOneAndDelete error on post movies/delete = " + err})       
        });
});





//UPLOAD GIFS TO MOVIES
//Set picture location

let storage = multer.diskStorage({
    destination: './public/data/uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

let upload = multer(
{ storage: storage ,
fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
}});


function checkFileType (file, cb) {
    const fileTypes = /gif/;
    const extensionName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if(extensionName){
        return cb(null, true);
    } else {
        cb("Error: funny gifs only.");
    }
};


router.get('/movies/upload', (req, res) => {
    const filter = {};
    
    Movie.find(filter)
        .then(movies => {
            res.render('upload', { movies: movies })
        })
        .catch(err => {
            res.status(500).send({error: "Movie.find error on get movies/upload = " + err})
        });
    
});

router.post('/movies/upload', upload.single('picture'), (req, res, next) => {
    if(!req.file){
        res.status(500).send({error: "Please select an image!"});
    };

    console.log('For ' + req.body.title)
    console.log('Picture uploaded to ' + req.file.path)

    let url = req.file.path.replace('public', '')

    let newPicture = {
        pictureUrl: url
        };

    let search = { title: req.body.title }

    Movie.findOne({pictureUrl: url})
        .then(picture => {
            if(picture){
                res.status(500).send({error: "Picture already uploaded!"})
            }

            Movie.findOneAndUpdate(search, newPicture)
                .then(img => {
                    res.redirect('/movies/pictures')
                })
            })
        .catch(err => {
            res.status(500).send({error: "Movie.findOne error on post movies/upload = " + err})
        });

});



router.get('/movies/pictures', (req, res) => {
    let filter = {};

    Movie.find(filter)
        .then(picture => {
            res.render('pictures', { movies: picture })
        })
        .catch(err => {
            res.status(500).send({error: "Movie.find error on get movies/pictures = " + err})
        });
})

module.exports = router;