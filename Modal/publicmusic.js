const mongoose = require('mongoose');

const Playlist = new mongoose.Schema({
    language: {  // Corrected typo 'langvage' -> 'language'
        type: String,
        required: true
    },
    type: {
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
    publicmusic: {
        type: Boolean,
        default: true
    },

},
    { timestamps: true });

module.exports = mongoose.model('Playlist', Playlist);  
