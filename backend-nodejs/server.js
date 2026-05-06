const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

app.use("/api/product", require("./routers/productRoute"));
app.use("/api/bill", require("./routers/billRoute"));
app.use("/api/reports", require("./routers/reportRoute"));
app.use("/api/auth", require("./routers/authRoute"));



// ⭐ IMPORTANT: SERVER START HERE
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});