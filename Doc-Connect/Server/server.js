const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();
connectDB();

app.use(bodyParser.json());
//console.log("hello");
const corsOptions = {
    origin: 'http://localhost:4200', // Replace with your Angular app's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get('/', (req, res) => res.send('Hello world!'));

app.use('/api/patient',require('./routes/PatientRoutes'));

app.use('/api/doctor',require('./routes/DoctorRoutes'));


var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

app.use('/api/create/orderId',(req,res) => {

    console.log('create orderId request',req.body);

    var options = {
        amount: req.body.amount,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_1"
    };

    instance.orders.create(options, function(err, order) {
        console.log(order);

        res.send({orderId : order.id});
    });
});

app.post("/api/payment/verify", (req, res)=> {
    let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

    var crypto = require("crypto");
    var expectedSignature = crypto.createhnac( sha256, process.env.key_secret)
                                            .update(body.toString())
                                            .digest('hex');

    console.log("sig recived ", req.body.responce.response.razorpay_signature);
    console.log("sig genrated ", expectedSignature);

    if(expectedSignature === req.body.responce.response.razorpay_signature) 
        responce ={"signatureIsValid":'true'}

    res.send(response);
    
});

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));