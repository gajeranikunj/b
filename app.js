var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs');

var Loginsinup = require('./routes/LoginSinup');
var publicmusic = require('./routes/publicmusic');
var profile = require('./routes/profile');
var singer = require('./routes/singer');

var app = express();
var cors = require('cors')
app.use(cors())

var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/API')
  .then(() => {
    console.log("Connected successfully to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/Loginsingup', Loginsinup);
app.use('/profile', profile);
app.use('/publicmusic', publicmusic);
app.use('/singer', singer);



app.get("/file/:name",  async (req, res) => {
  const filePath = path.join(__dirname, 'public/images', req.params.name);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      return res.status(404).send('Image not found');
    }
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': stats.size
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
