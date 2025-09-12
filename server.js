const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./config/db");
const cors = require("cors");

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
// Allow all origins with credentials
app.use(
    cors({
        origin: true, // allows all origins
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true, // important if using session/cookies
    })
);
// Health Check for Render
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

// JWT Auth Middleware (no sessions!)
const authMiddleware = require('./middlewares/auth.middleware')();
app.use(authMiddleware.initialize());

// auth api
app.use("/api/auth", require("./routes/auth.routes"));
// user api
app.use("/api/user", require("./routes/user.routes"));
// product api
app.use("/api/product", require("./routes/product.route"));

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
startServer();
