const Playlist = require('../Modal/publicmusic');  // Corrected model import
const Profile = require("../Modal/Profile")  // Importing the Profile model once
const fs = require('fs');  // Import fs to delete previous images
const path = require('path');  // Useful for resolving file paths
const { profile } = require('console');
exports.Create = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming the user ID is available in req.user
        const data = await Profile.findOne({ userId: userId });
        console.log(data._id);

        // Modify how we store the file paths
        const img = req.files["img"] ? `http://localhost:3005/file/${req.files["img"][0].filename}` : null;
        const audio = req.files["audio"] ? `http://localhost:3005/file/${req.files["audio"][0].filename}` : null; // Changed to match the new requirement

        // Check if the profile is private and reject upload
        if (data.publicsong === false) {
            if (req.files["img"]) {
                fs.unlinkSync(path.join(__dirname, '..', req.files["img"][0].path));
            }
            if (req.files["audio"]) {
                fs.unlinkSync(path.join(__dirname, '..', req.files["audio"][0].path));
            }
            return res.status(200).json({
                status: "file",
                message: "You cannot share a public profile for live music.",
            });
        }

        // Validate input fields
        // console.log(req.body);
        const { type, nameOfMusic, language } = req.body;
        if (!type || !nameOfMusic || !language) {
            return res.status(400).json({
                status: "fail",
                message: "All fields must be provided",
            });
        }

        // If both files (img, audio) are missing, return an error
        if (!img || !audio) {
            // If Multer didn't upload the files, return an error without saving the files
            return res.status(400).json({
                status: "fail",
                message: "Both image and audio files are required.",
            });
        }

        const musicEntry = await Playlist.create({
            type,
            nameOfMusic,
            language,
            img,
            audio,
            profileid: data._id
        });

        const updatedProfile = await Profile.findOne({ userId: userId });
        updatedProfile.playlists.push(musicEntry._id);
        // console.log(updatedProfile);

        const up = await Profile.findByIdAndUpdate(updatedProfile._id, updatedProfile, { new: true });

        console.log(up);

        res.status(201).json({
            status: "successful",
            message: "Music created successfully",
            data: { type, nameOfMusic, language, img, audio }
        });

    } catch (error) {
        console.error("Error creating music:", error);
        // If there's an error, handle file cleanup (delete uploaded files if necessary)
        if (req.files["img"]) {
            fs.unlinkSync(path.join(__dirname, '..', req.files["img"][0].path));  // Delete uploaded image if creation fails
        }
        if (req.files["audio"]) {
            fs.unlinkSync(path.join(__dirname, '..', req.files["audio"][0].path));  // Delete uploaded audio if creation fails
        }

        // Respond with an error
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
};
function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}


exports.show = async (req, res) => {
    try {
        const showdata = await Playlist.find();

        // Shuffle using Fisher-Yates
        const shuffledData = fisherYatesShuffle(showdata);
        console.log(shuffledData);

        res.status(200).json({
            status: "success",
            message: 'Data fetched successfully',
            data: shuffledData
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(404).json({
            status: "fail",
            message: "Failed to fetch data"
        });
    }
}
exports.Suerch = async (req, res) => {
    const name = req.params.name;
    name = name.trim();
    console.log("Suerching for name:", name);

    try {
        const showdata = await Playlist.find({ nameOfMusic: name });
        res.status(200).json({
            status: "success",
            message: 'Data fetched successfully',
            data: showdata
        });
    } catch (error) {
        console.error("Error fetching data by name:", error);
        res.status(404).json({
            status: "fail",
            message: "Failed to fetch data"
        });
    }
}

exports.Delete = async (req, res) => {
    const Id = req.params.id;

    try {
        const deletdata = await Playlist.findByIdAndDelete(Id);
        res.status(200).json({
            status: "success",
            message: 'Data deleted successfully',
            data: deletdata
        });
    } catch (error) {
        console.error("Error deleting data:", error);
        res.status(500).json({
            status: "fail",
            message: error.message,
            data: []
        });
    }
};

exports.updete = async (req, res) => {
    let Id = req.params.id;

    // Update how we store the file paths
    const img = req.files["img"] ? `http://localhost:3005/file/${req.files["img"][0].filename}` : null;
    const audio = req.files["audio"] ? `http://localhost:3005/file/${req.files["audio"][0].filename}` : null; // Changed to match the new requirement

    Id = Id.replace(/^id:/, '');

    try {
        const existingData = await Playlist.findById(Id);

        if (!existingData) {
            return res.status(404).json({
                status: "fail",
                message: "Data not found for this ID"
            });
        }

        // If the new image is provided, delete the old image
        if (img && existingData.img) {
            // Extract filename from the URL
            const oldImageFilename = existingData.img.split('/').pop();
            const oldImagePath = path.join(__dirname, '..', 'public', 'images', oldImageFilename);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Prepare the updated data
        const { language, type, nameOfMusic } = req.body;
        const updatedData = {
            language,
            type,
            nameOfMusic,
            img: img || existingData.img,  // Use existing image if no new one is provided
            audio: audio || existingData.audio  // Use existing audio if no new one is provided
        };

        // Update the record
        const updated = await Playlist.findByIdAndUpdate(Id, updatedData, { new: true });

        if (!updated) {
            return res.status(404).json({
                status: "fail",
                message: "Failed to update data"
            });
        }

        res.status(200).json({
            status: "success",
            message: 'Data updated successfully',
            data: updated
        });
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({
            status: "fail",
            message: "Error updating data",
            data: []
        });
    }
};


exports.getmusiclist = async (req, res) => {
    try {
        const data = await Profile.find({ publicsong: true, playlists: { $ne: [] } }).populate("playlists")
        res.status(200).json({
            status: "success",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};

exports.mymusic = async (req, res) => {
    const userId = req.user.id;
    try {
        const data = await Profile.findOne({ userId: userId }).populate("playlists")
        res.status(200).json({
            status: "success",
            data: data.playlists
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};

