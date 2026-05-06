const Bill = require("../models/bill");
const Product = require("../models/product");
const User = require("../models/user");


exports.getWeeklyReport = async (req, res) => {
    try {
        const result = [];

        const today = new Date();

        for (let i = 0; i < 6; i++) {
            const day = new Date();
            day.setDate(today.getDate() - i);

            // if (day.getDay() === 0) continue;

            const start = new Date(day);
            start.setHours(0, 0, 0, 0);

            const end = new Date(day);
            end.setHours(23, 59, 59, 999);

            const bills = await Bill.find({
                createdAt: { $gte: start, $lte: end }
            });

            let totalSale = 0;
            let totalCost = 0;
            let totalProfit = 0;

            bills.forEach(bill => {
                totalSale += bill.totalSale;
                totalCost += bill.totalCost;
                totalProfit += bill.totalProfit;
            });

            result.push({
                date: start.toISOString().split("T")[0],
                day: day.toLocaleDateString("en-US", { weekday: "short" }),
                totalSale,
                totalCost,
                totalProfit
            });
        }

        res.json(result);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "Date is required" });
        }

        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);
        const bills = await Bill.find({
            createdAt: {
                $gte: new Date(date + "T00:00:00.000Z"),
                $lte: new Date(date + "T23:59:59.999Z")
            }
        });


        let totalSale = 0;
        let totalCost = 0;
        let totalProfit = 0;

        bills.forEach(bill => {
            totalSale += bill.totalSale;
            totalCost += bill.totalCost;
            totalProfit += bill.totalProfit;
        });

        res.json({
            date,
            totalSale,
            totalCost,
            totalProfit,
            totalBills: bills.length
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLastMonthReport = async (req, res) => {
    try {
        const now = new Date();

        // First day of current month
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // First day of last month
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Last day of last month
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const bills = await Bill.find({
            createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth,
            },
        });

        let totalSale = 0;
        let totalCost = 0;
        let totalProfit = 0;

        bills.forEach((bill) => {
            totalSale += bill.totalSale;
            totalCost += bill.totalCost;
            totalProfit += bill.totalProfit;
        });

        res.json({
            month: startOfLastMonth.toISOString().slice(0, 7), // YYYY-MM
            totalSale,
            totalCost,
            totalProfit,
            totalBills: bills.length,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// exports.getCustomReport = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         error: "startDate and endDate are required"
//       });
//     }

//     const start = new Date(`${startDate}T00:00:00.000Z`);
//     const end = new Date(`${endDate}T23:59:59.999Z`);

//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//       return res.status(400).json({
//         error: "Invalid date format"
//       });
//     }

//     if (end < start) {
//       return res.status(400).json({
//         error: "endDate must be greater than startDate"
//       });
//     }

//     const bills = await Bill.find({
//       createdAt: {
//         $gte: start,
//         $lte: end
//       }
//     });

//     let totalSale = 0;
//     let totalCost = 0;
//     let totalProfit = 0;

//     let csv = "Bill No,Sale,Cost,Profit,Date\n";

//     bills.forEach((bill) => {
//       const date = new Date(bill.createdAt).toISOString().split("T")[0];

//       csv += `${bill.billNo},${bill.totalSale},${bill.totalCost},${bill.totalProfit},${date}\n`;

//       totalSale += bill.totalSale;
//       totalCost += bill.totalCost;
//       totalProfit += bill.totalProfit;
//     });

//     csv += `\n`;
//     csv += `TOTAL,${totalSale},${totalCost},${totalProfit},\n`;
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader("Content-Disposition", `attachment; filename=report-${startDate}-to-${endDate}.csv`);
//     return res.status(200).send(csv);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.getCustomReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const user = await User.findById(req.user.id);

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required",
      });
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
    });

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${startDate}-to-${endDate}.pdf`
    );

    doc.pipe(res);

    // ================= CONFIG =================
    const startX = 50;
    const pageHeight = doc.page.height;
    const bottomMargin = 60;

    let y = 0;

    const col = {
      no: startX,
      bill: startX + 40,
      sale: startX + 160,
      cost: startX + 260,
      profit: startX + 360,
      date: startX + 450,
    };

    let totalSale = 0;
    let totalCost = 0;
    let totalProfit = 0;

    // ================= HEADER =================
    const drawHeader = () => {
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#1f3a93")
        .text(process.env.ORGANIZATION_NAME, { align: "center" });

      doc.moveDown(0.3);

      doc
        .fontSize(11)
        .fillColor("gray")
        .text("Sales Report (Summary)", { align: "center" });

      doc.moveDown(0.5);

      doc
        .strokeColor("#1f3a93")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1);

      doc.fontSize(10).fillColor("black");
      doc.text(`From: ${startDate}`);
      doc.text(`To: ${endDate}`);
      doc.text(`Presented To: ${user.name}`);

      doc.moveDown(1.5);

      y = doc.y;
    };

    // ================= TABLE HEADER =================
    const drawTableHeader = () => {
      doc.rect(startX, y, 500, 22).fill("#2c3e50");

      doc.fillColor("white").font("Helvetica-Bold");

      doc.text("No", col.no, y + 6);
      doc.text("Bill No", col.bill, y + 6);
      doc.text("Sale", col.sale, y + 6);
      doc.text("Cost", col.cost, y + 6);
      doc.text("Profit", col.profit, y + 6);
      doc.text("Date", col.date, y + 6);

      y += 30;
    };

    // ================= PAGE BREAK =================
    const checkPageBreak = (rowHeight = 25) => {
      if (y + rowHeight > pageHeight - bottomMargin) {
        doc.addPage();
        drawHeader();
        drawTableHeader();
      }
    };

    // ================= START =================
    drawHeader();
    drawTableHeader();

    // ================= ROWS =================
    bills.forEach((bill, index) => {
      const date = new Date(bill.createdAt).toISOString().split("T")[0];

      totalSale += bill.totalSale || 0;
      totalCost += bill.totalCost || 0;
      totalProfit += bill.totalProfit || 0;

      const rowHeight = 25;
      checkPageBreak(rowHeight);

      // alternate row color
      if (index % 2 === 0) {
        doc.rect(startX, y - 5, 500, rowHeight).fill("#f4f6f7");
      }

      doc.fillColor("black").font("Helvetica");

      doc.text(index + 1, col.no, y);
      doc.text(bill.billNo || "-", col.bill, y);
      doc.text(bill.totalSale || 0, col.sale, y);
      doc.text(bill.totalCost || 0, col.cost, y);
      doc.text(bill.totalProfit || 0, col.profit, y);
      doc.text(date, col.date, y);

      y += rowHeight;
    });

    // ================= TOTAL SECTION =================
    checkPageBreak(80);

    y += 20;

    doc
      .fontSize(12)
      .fillColor("black")
      .text("TOTAL SALE:", 350, y, { continued: true })
      .fillColor("#27ae60")
      .text(` Rs ${totalSale}`);

    doc
      .fontSize(12)
      .fillColor("black")
      .text("TOTAL COST:", 350, y + 20, { continued: true })
      .fillColor("#e74c3c")
      .text(` Rs ${totalCost}`);

    doc
      .fontSize(12)
      .fillColor("black")
      .text("TOTAL PROFIT:", 350, y + 40, { continued: true })
      .fillColor("#2980b9")
      .text(` Rs ${totalProfit}`);

    doc.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};