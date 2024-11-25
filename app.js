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


app.get("/file/:name", (req, res) => {
  let filePath;
  const fileName = req.params.name;

  if (fileName.includes("audio")) {
    filePath = path.join(__dirname, 'public/audio', fileName);
  } else {
    filePath = path.join(__dirname, 'public/images', fileName);
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    const fileSize = stats.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return res.status(416).send('Requested range not satisfiable');
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': fileName.includes("audio") ? 'audio/mpeg' : 'image/jpeg'
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': fileName.includes("audio") ? 'audio/mpeg' : 'image/jpeg'
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  });
});


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
