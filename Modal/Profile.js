const mongoose = require('mongoose');
const ProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    },
    about: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    img: {
        type: String,
        default: null
    },
    bgimg: {
        type: String,
        default: null // Add this for the background image
    },
    publicsong: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoginSingup',
        required: true
    },
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist',
        required: false
    }]
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
