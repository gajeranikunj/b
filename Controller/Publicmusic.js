const Category = require('../Modal/publicmusic');  // Corrected model import
const fs = require('fs');  // Import fs to delete previous images
const path = require('path');  // Useful for resolving file paths

exports.Create = async (req, res) => {
    try {
        const { name, type, nameOfSinger, nameOfMusic, language } = req.body;
        const img = req.files["img"] ? req.files["img"][0].path : null;
        const audio = req.files["audio"] ? req.files["audio"][0].path : null;

        // Create the music entry
        const musicEntry = await Category.create({ name, type, nameOfSinger, nameOfMusic, language, img, audio });

        // Add the music entry to the user's profile playlists
        const userId = req.user.id; // Assuming the user ID is available in req.user
        const Profile = require('../Modal/Profile'); // Import the Profile model
        await Profile.findByIdAndUpdate(userId, { $addToSet: { playlists: musicEntry._id } }); // Add music entry to playlists

        res.status(201).json({
            status: "successful",
            message: "Music created successfully",
            data: { name, type, nameOfSinger, nameOfMusic, language, img, audio }
        });
    } catch (error) {
        console.error("Error creating music:", error);
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
        const { language, type, nameOfSinger, nameOfMusic } = req.body;
        const updatedData = {
            language, 
            type, 
            nameOfSinger, 
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