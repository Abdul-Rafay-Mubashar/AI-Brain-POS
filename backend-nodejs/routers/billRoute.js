const express = require("express");
const router = express.Router();
const bill = require("../controllers/billingController");
const protect = require("../middleware/authmiddleware");

router.get("/search", protect, bill.searchBillById);
router.get("/date", protect, bill.getBillsByDate);
router.post("/", protect, bill.createBill);
router.get("/", protect, bill.getBills);
router.get("/:id", protect, bill.getBillById);
router.put("/:id", protect, bill.updateBill);
router.get("/download/:id", protect, bill.downloadBill);



module.exports = router;