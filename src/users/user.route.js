const express = require('express');
const router = express.Router();
const User = require('./user.model');
const generateToken = require('../middleware/generateToken');


// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username, password });
        await user.save();
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred while creating the user' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        const token = await generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        });

        res.status(200).send({
            message: 'User logged in successfully', token, user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred while logging in' });
    }
});

//logout endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send({ message: 'User logged out successfully' });
});

//delete user endpoint
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ message: 'Failed to delete user' });
    }
})

//get all users endpoint
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, "id email role").sort({ createdAt: -1 });
        res.status(200).send(users);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred while fetching users' });
    }
})

//update user role endpoint
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User updated successfully', user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred while updating the user' });
    }
})

//edit or update profile
router.patch('/edit-profile', async (req, res) => {
    try {
        const { userId, username, profileImage, bio, profession } = req.body;
        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        if (username !== undefined) user.username = username;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (bio !== undefined) user.bio = bio;
        if (profession !== undefined) user.profession = profession;

        await user.save();
        res.status(200).send({
            message: 'Profile updated successfully', user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred while updating the user' });
    }
})

module.exports = router;