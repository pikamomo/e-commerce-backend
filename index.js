const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config();
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

// middleware
app.use(express.json({ limit: "25mb" }))
app.use((express.urlencoded({ limit: "25mb", extended: true })))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: 'https://e-commerce-frontend-ruddy-phi.vercel.app',
    credentials: true
}))

const uploadImages = require('./src/utils/uploadImages')
//routes

const authRoutes = require('./src/users/user.route')
const productRoutes = require('./src/products/products.route')
const reviewRoutes = require('./src/reviews/reviews.route')
const orderRoutes = require('./src/order/orders.route')
const statsRoutes = require('./src/stats/stats.route')


app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/stats', statsRoutes)

main().then(() => console.log('mongodb is connected')).catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.DB_URL);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
}

app.post('/uploadImage', (req, res) => {
    uploadImages(req.body.image)
        .then((url) => {
            res.send(url)
        })
        .catch((error) => res.status(500).send(error))
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})