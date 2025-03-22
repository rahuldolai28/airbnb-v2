const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');


const listingSchema = new mongoose.Schema({
    title: String,
    description: String,
    // image: {
    //     type: String,
    //     default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnww2",
    //     set: (v) => v === "" ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnww2" : v
    // },
    image: {
        filename: String,
        url: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

listingSchema.post('findOneAndDelete', async function (listing) {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
// The default image URL didn't work because the validator was rejecting empty values before the default could be applied.
// To fix this, we should modify the validation to allow empty/null values, and let Mongoose handle setting the default:


