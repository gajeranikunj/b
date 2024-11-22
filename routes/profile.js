var express = require('express');
var router = express.Router();
var UC = require('../Controller/profile');
const AM = require('../Midlewhere/Autho');
router.post('/setprofile/:id', AM.tokensecure,  UC.update);
module.exports = router;
