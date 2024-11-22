var express = require('express');
var router = express.Router();
var UC = require('../Controller/LoginSinup')
// const upload = require("../Controller/multer");
const AM = require('../Midlewhere/Autho'); 
/* GET home page. */
router.post('/Login',  UC.Login)
router.post('/Singup', UC.Singup)
router.post('/changepassword', AM.tokensecure, UC.changepassword)


router.get('/data',AM.tokensecure, UC.getdata)


module.exports = router;
