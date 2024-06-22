const mongoose = require('mongoose');

const pictureSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Picture = mongoose.model('Picture', pictureSchema);

module.exports = Picture;