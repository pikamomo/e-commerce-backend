const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchecma = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    profileImage: String,
    bio: { type: String, maxlength: 200 },
    profession: String,
    createAt: {
        type: Date,
        default: Date.now
    }
})

//hash password
userSchecma.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
});

// match password
userSchecma.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

const User = model('User', userSchecma);
module.exports = User;