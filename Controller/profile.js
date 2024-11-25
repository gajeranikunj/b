const Profile = require('../Modal/Profile');
const mongoose = require('mongoose');
const upload = require('./multer');
const fs = require('fs');
const path = require('path');
const { profile } = require('console');


exports.update = async (req, res) => {
    console.log(req.file);
    try {
        upload.fields([
            { name: 'img', maxCount: 1 },
            { name: 'bgimg', maxCount: 1 }
        ])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: "fail",
                    message: err.message,
                });
            }

            const { name, country, about, email, deleteImage, deleteBgImage, publicsong } = req.body;
            const updateData = {};

            if ('name' in req.body) updateData.name = name || null;
            if ('country' in req.body) updateData.country = country || null;
            if ('about' in req.body) updateData.about = about || null;
            if ('email' in req.body) updateData.email = email || null;
            if ('publicsong' in req.body) updateData.publicsong = publicsong || false;

            const oldProfile = await Profile.findById(req.params.id);

            // Logs for debugging
            console.log("Existing profile:", oldProfile);
            console.log("Received files:", req.files);

            // Handle profile image deletion
            if (deleteImage === 'true' && oldProfile && oldProfile.img) {
                const oldImageName = oldProfile.img.split('/').pop();
                const oldImagePath = path.join(__dirname, '../public/images', oldImageName);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                updateData.img = null;
            }

            // Handle background image deletion
            if (deleteBgImage === 'true' && oldProfile && oldProfile.bgimg) {
                const oldBgImageName = oldProfile.bgimg.split('/').pop();
                const oldBgImagePath = path.join(__dirname, '../public/images', oldBgImageName);
                if (fs.existsSync(oldBgImagePath)) {
                    fs.unlinkSync(oldBgImagePath);
                }
                updateData.bgimg = null;
            }

            // Handle new profile image upload
            if (req.files && req.files['img']) {
                if (oldProfile && oldProfile.img) {
                    const oldImageName = oldProfile.img.split('/').pop();
                    const oldImagePath = path.join(__dirname, '../public/images', oldImageName);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                updateData.img = `http://localhost:3005/file/${req.files['img'][0].filename}`;
            }

            // Handle new background image upload
            if (req.files && req.files['bgimg'] && req.files['bgimg'][0]) {
                if (oldProfile && oldProfile.bgimg) {
                    const oldBgImageName = oldProfile.bgimg.split('/').pop();
                    const oldBgImagePath = path.join(__dirname, '../public/images', oldBgImageName);
                    if (fs.existsSync(oldBgImagePath)) {
                        fs.unlinkSync(oldBgImagePath);
                    }
                }
                updateData.bgimg = `http://localhost:3005/file/${req.files['bgimg'][0].filename}`;
            }

            console.log("Update data to save:", updateData);

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

            console.log("Updated profile:", updatedProfile);

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


exports.addinlis = async (req, res) => {
    try {
        const data = await Profile.findOneAndUpdate(
            { userId: req.user.id },
            { $addToSet: { customplaylists: req.body.id } }, // Prevent duplicates
            { new: true }
        );
        if (!data) {
            return res.status(404).json({ status: "fail", message: "Profile not found" });
        }
        return res.status(200).json({ status: "success", data });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

