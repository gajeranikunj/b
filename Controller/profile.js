const Profile = require('../Modal/Profile');
const mongoose = require('mongoose');
const upload = require('./multer');
const fs = require('fs');
const path = require('path');

exports.update = async (req, res) => {
    try {
        upload.single('img')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: "fail",
                    message: err.message,
                });
            }

            const { name, country, about, email, deleteImage, publicsong } = req.body;
            const updateData = {};

            if ('name' in req.body) updateData.name = name || null;
            if ('country' in req.body) updateData.country = country || null;
            if ('about' in req.body) updateData.about = about || null;
            if ('email' in req.body) updateData.email = email || null;
            if ('publicsong' in req.body) updateData.publicsong = publicsong || false;

            const oldProfile = await Profile.findById(req.params.id);

            // Handle image deletion
            if (deleteImage === 'true' && oldProfile && oldProfile.img) {
                const oldImageName = oldProfile.img.split('/').pop();
                const oldImagePath = path.join(__dirname, '../public/images', oldImageName);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                updateData.img = null;
            }
            // Handle new image upload
            else if (req.file) {
                if (oldProfile && oldProfile.img) {
                    const oldImageName = oldProfile.img.split('/').pop();
                    const oldImagePath = path.join(__dirname, '../public/images', oldImageName);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                updateData.img = `http://localhost:3005/file/${req.file.filename}`;
            }

            const updatedProfile = await Profile.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!updatedProfile) {
                return res.status(404).json({
                    status: "fail",
                    message: "Profile not found",
                });
            }

            return res.status(200).json({
                status: "success",
                data: updatedProfile
            });
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};
