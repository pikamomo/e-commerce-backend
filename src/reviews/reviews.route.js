const express = require('express');
const router = express.Router();
const Reviews = require('./reviews.model');
const Product = require('../products/products.model');

//post a new review
router.post("/post-review", async (req, res) => {
    try {
        const { comment, rating, productId, userId } = req.body;
        if (!comment || !rating || !productId || !userId) {
            return res.status(400).send("All input is required");
        }
        const existingReview = await Reviews.findOne({ productId, userId });
        if (existingReview) {
            // update review
            existingReview.comment = comment;
            existingReview.rating = rating;
            await existingReview.save();
        } else {
            const newReview = new Reviews({
                comment, rating, productId, userId
            })
            await newReview.save();
        }

        //calculate average rating
        const reviews = await Reviews.find({ productId });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const avgRating = totalRating / reviews.length;
            const product = await Product.findById(productId);
            if (product) {
                product.rating = avgRating;
                await product.save({ validateBeforeSave: false });
            } else {
                return res.status(404).send("Product not found");
            }
        }

        res.status(200).send({
            message: "Review posted successfully",
            reviews: reviews
        })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

router.get("/total-reviews", async (req, res) => {
    try {
        const totalReviews = await Reviews.countDocuments({});
        res.status(200).send({ totalReviews }); 
    } catch (error) {
        console.log(error);
    }
})

//get review by userid
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).send("UserId is required");
    }
    try {
        const reviews = await Reviews.find({ userId }).sort({ createdAt: -1 });
        if (reviews.length === 0) {
            return res.status(404).send({ message: "No reviews found" });
        }
        res.status(200).send(reviews);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;