const express = require("express");
const router = express.Router();
const reports = require("../controllers/reportController");
const protect = require("../middleware/authmiddleware");


router.get("/daily", protect, reports.getDailyReport);
router.get("/weekly", protect, reports.getWeeklyReport);
router.get("/monthly", protect, reports.getLastMonthReport);
router.get("/custom", protect, reports.getCustomReport);


module.exports = router;