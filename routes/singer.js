var express = require('express');
var router = express.Router();
var PC = require('../Controller/singer')
var AM = require('../Midlewhere/Autho')
var multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

router.post('/Create',upload.single('image'),AM.tokensecure,PC.Create)
router.get('/Suerch/:id',AM.tokensecure,PC.Suerch)
router.get('/show',AM.tokensecure,PC.show)
router.delete('/Delete/:id',AM.tokensecure,PC.Delete)
router.patch('/updete/:id',upload.single('image'),AM.tokensecure,PC.updete)

module.exports = router;