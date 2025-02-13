const express = require('express');
const router = express.Router();
const Product = require('./products.model');
const verifyToken = require('../middleware/verifyToken');
const Reviews = require('../reviews/reviews.model');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post("/create-product", async (req, res) => {
    try {
        const newProduct = new Product({
            ...req.body
        });

        const savedProduct = await newProduct.save();
        const reviews = await Product.find({ productId: savedProduct.productId });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const avgRating = totalRating / reviews.length;
            savedProduct.rating = avgRating;
            await savedProduct.save();
        }
        res.status(201).send(savedProduct);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

router.get("/", async (req, res) => {
    try {
        const { category, color, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        let filter = {};
        if (category && category !== "all") {
            filter.category = category;
        }
        if (color && color !== "all") {
            filter.color = color;
        }
        if (minPrice && maxPrice) {
            const min = parseInt(minPrice);
            const max = parseInt(maxPrice);
            if (!isNaN(min) && !isNaN(max)) {
                filter.price = {
                    $gte: min,
                    $lte: max
                }
            }
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));
        const products = await Product.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("author", "email")
            .sort({ createdAt: -1 });

        res.status(200).send({ products, totalPages, totalProducts });
    } catch (error) {
        console.log(error);
    }
})

// get single product
router.get("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId).populate("author", "email username");
        if (!product) {
            return res.status(404).send("Product not found");
        }
        const reviews = await Reviews.find({ productId }).populate("userId", "username email");
        res.status(200).send({ product, reviews });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// update product
router.patch("/update-product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        // const { title, content, category } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { ...req.body },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).send({ message: "Product not found" });
        }

        res
            .status(200)
            .send({
                message: "Product updated successfully",
                product: updatedProduct,
            });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send({ message: "Failed to fetch product" });
    }
});

//delete product
router.delete("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).send({ message: "Product not found" });
        }
        await Reviews.deleteMany({ productId });
        res.status(200).send({ message: "Product deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

// get related products
router.get("/related/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Product id is required");
        }
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).send("Product not found");
        }
        const titleRegex = new RegExp(
            product.name.split(" ").filter(word => word.length > 1)
                .join("|"), "i"
        );

        const relatedProducts = await Product.find({
            _id: { $ne: id },
            $or: [
                { name: { $regex: titleRegex } },
                { category: product.category }
            ]
        });
        res.status(200).send(relatedProducts);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;