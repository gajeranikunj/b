const express = require('express');
const router = express.Router();
const CC = require('../Controller/Publicmusic');  // Music-related controller
const AM = require('../Midlewhere/Autho');       // Authentication middleware
const upload = require("../Controller/multer");

router.post('/create', AM.tokensecure, upload.fields([{ name: "img", maxCount: 1 }, { name: "audio", maxCount: 1 }]), CC.Create);

router.get('/Suerch/:id', AM.tokensecure, CC.Suerch);
router.get('/show', AM.tokensecure, CC.show);
router.delete('/Delete/:id', AM.tokensecure, CC.Delete);
router.patch('/updete/:id', AM.tokensecure, upload.fields([{ name: "img", maxCount: 1 }, { name: "audio", maxCount: 1 }]), CC.updete);

module.exports = router;