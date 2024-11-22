const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    language: {  // Corrected typo 'langvage' -> 'language'
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    nameOfSinger: {  // Standardized field name
        type: String,
        required: true
    },
    nameOfMusic: {  // Standardized field name
        type: String,
        required: true
    },
    img: {
        type: String,
        require: true
    },
    audio: {
        type: String,
        require: true
    },
},
{ timestamps: true });

module.exports = mongoose.model('Category', Schema);  // Corrected typo 'Cetegory' -> 'Category'
