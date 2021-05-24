const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = new Schema ({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Tweet = mongoose.model('tweet', tweetSchema);
module.exports = Tweet;