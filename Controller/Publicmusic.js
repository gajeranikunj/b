const Category = require('../Modal/publicmusic');  // Corrected model import
const Profile = require("../Modal/Profile")  // Importing the Profile model once
const fs = require('fs');  // Import fs to delete previous images
const path = require('path');  // Useful for resolving file paths
const { profile } = require('console');
exports.Create = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming the user ID is available in req.user
        const data = await Profile.findOne({ userId: userId });
        const img = req.files["img"] ? req.files["img"][0].path : null;
        const audio = req.files["audio"] ? req.files["audio"][0].path : null;
        // Check if the profile is private and reject upload
        if (data.publicsong === false) {
            if (img) {
                // Delete the uploaded image if profile is private
                fs.unlinkSync(path.join(__dirname, '..', img));
            }
            if (audio) {
                // Delete the uploaded audio if profile is private
                fs.unlinkSync(path.join(__dirname, '..', audio));
            }

            return res.status(200).json({
                status: "file",
                message: "You cannot share a public profile for live music.",
            });
        }
        // Validate input fields
        console.log(req.body);
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

        const musicEntry = await Category.create({
            type,
            nameOfMusic,
            language,
            img,
            audio
        });

        const updatedProfile = await Profile.findOne({ userId: userId });
        updatedProfile.playlists.push(musicEntry._id); 
        console.log(updatedProfile);

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

exports.show = async (req, res) => {
    try {
        const showdata = await Category.find();
        res.status(200).json({
            status: "success",
            message: 'Data fetched successfully',
            data: showdata
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
    const Id = req.params.id;
    console.log("Searching for ID:", Id);

    try {
        const showdata = await Category.findById(Id);
        res.status(200).json({
            status: "success",
            message: 'Data fetched successfully',
            data: showdata
        });
    } catch (error) {
        console.error("Error fetching data by ID:", error);
        res.status(404).json({
            status: "fail",
            message: "Failed to fetch data"
        });
    }
}

exports.Delete = async (req, res) => {
    const Id = req.params.id;

    try {
        const deletdata = await Category.findByIdAndDelete(Id);
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
    console.log("Updating data for ID:", Id);

    // Handle new files (image and audio)
    const img = req.files["img"] ? req.files["img"][0].path : null;
    const audio = req.files["audio"] ? req.files["audio"][0].path : null;

    // Remove 'id:' prefix, if present
    Id = Id.replace(/^id:/, '');  // This removes the 'id:' prefix, if it exists

    try {
        // Get existing data from the database
        const existingData = await Category.findById(Id);

        if (!existingData) {
            return res.status(404).json({
                status: "fail",
                message: "Data not found for this ID"
            });
        }

        // If the new image is provided, delete the old image
        if (img && existingData.img) {
            // If there's a new image, delete the old one
            fs.unlinkSync(path.join(__dirname, '..', existingData.img));  // Deletes the old image file
        }

        // If the new audio file is provided, delete the old audio file
        if (audio && existingData.audio) {
            // If there's a new audio, delete the old one
            fs.unlinkSync(path.join(__dirname, '..', existingData.audio));  // Deletes the old audio file
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
        const updated = await Category.findByIdAndUpdate(Id, updatedData, { new: true });

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
        const data = await Profile.find({ publicsong: true }).populate("playlists")
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

