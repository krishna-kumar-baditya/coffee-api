const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");
const session = require('express-session');
const path = require('path')
const cors = require('cors')
// static folder
app.use('/uploads',express.static(path.join(__dirname,"/uploads")))


app.use(express.urlencoded({
    extended : true
}))
app.use(express.json())
// Allow all origins with credentials
app.use(cors({
  origin: true, // allows all origins
  methods : ["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
  credentials: true // important if using session/cookies
}));
app.use(session({
    secret: 'MyS3CR3T#@!@CGGmn',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    let auth = require('./middlewares/auth.middleware')(req, res, next)
    app.use(auth.initialize());
    if (req.session.token && req.session.token != null) {
        req.headers['token'] = req.session.token;
    }
    next();
});




// auth api
app.use('/api/auth',require('./routes/auth.routes'))
// user api
app.use('/api/user',require('./routes/user.routes'))
// product api
app.use('/api/product',require('./routes/product.route'))

const PORT = process.env.PORT || 3000;
// Start the server only after connecting to the database
async function startServer() {
    try {
        await db.connectDb();
        app.listen(PORT, () => {
            console.log(`server is running on http://127.0.0.1:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}
startServer()
