const Bill = require("../models/bill");
const Product = require("../models/product");
const User = require("../models/user")
const PDFDocument = require("pdfkit");


const generateBillId = async () => {
    const now = new Date();

    const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    const dayCode = days[now.getDay()];

    const date = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const count = await Bill.countDocuments({
        createdAt: { $gte: start, $lte: end }
    });

    return `${dayCode}-${date}${month}${year}-${count + 1}`;
};



exports.createBill = async (req, res) => {
    try {
        const { items } = req.body;

        let totalCost = 0;
        let totalSale = 0;

        const billItems = [];

        for (let item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    error: "Product not found",
                });
            }
            if (product.quantity < item.quantity) {
                return res.status(409).json({
                    error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
                });
            } if (product.price > item.salePrice) {
                return res.status(409).json({
                    error: `You are entering invalid price of ${product.name}. It should be atleaset ${product.price} you proposed price is ${item.salePrice}`,
                });
            }
        }
        for (let item of items) {
            const product = await Product.findById(item.product);

            const cost = product.price * item.quantity;
            const sale = item.salePrice * item.quantity;

            totalCost += cost;
            totalSale += sale;

            billItems.push({
                product: product._id,
                nameSnapshot: product.name,
                priceSnapshot: product.price,
                salePriceSnapshot: item.salePrice,
                quantity: item.quantity,
            });

            product.quantity -= item.quantity;
            await product.save();
        }

        const totalProfit = totalSale - totalCost;
        let billId = await generateBillId()

        const bill = await Bill.create({
            billNo: billId,
            items: billItems,
            totalCost,
            totalSale,
            totalProfit,
        });

        res.status(201).json(bill);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateBill = async (req, res) => {
    try {
        const { items } = req.body;
        const bill = await Bill.findById(req.params.id);

        if (!bill) {
            return res.status(404).json({ error: "Bill not found" });
        }



        let totalCost = 0;
        let totalSale = 0;

        const newItems = [];

        for (let item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }

            if (product.quantity < item.quantity) {
                return res.status(409).json({
                    error: `Insufficient stock for ${product.name}`,
                });
            }

            if (product.price > item.salePrice) {
                return res.status(409).json({
                    error: `Invalid price for ${product.name}`,
                });
            }
        }
        for (let oldItem of bill.items) {
            const product = await Product.findById(oldItem.product);
            if (product) {
                product.quantity += oldItem.quantity;
                await product.save();
            }
        }
        for (let item of items) {
            const product = await Product.findById(item.product);

            const cost = product.price * item.quantity;
            const sale = item.salePrice * item.quantity;

            totalCost += cost;
            totalSale += sale;

            newItems.push({
                product: product._id,
                nameSnapshot: product.name,
                priceSnapshot: product.price,
                salePriceSnapshot: item.salePrice,
                quantity: item.quantity,
            });

            product.quantity -= item.quantity;
            await product.save();
        }
        const totalProfit = totalSale - totalCost;


        bill.items = newItems;
        bill.totalCost = totalCost;
        bill.totalSale = totalSale;
        bill.totalProfit = totalProfit;

        await bill.save();

        res.json(bill);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBills = async (req, res) => {
    const bills = await Bill.find().populate("items.product");
    res.json(bills);
};

exports.getBillById = async (req, res) => {
    const bill = await Bill.findById(req.params.id).populate("items.product");

    if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);
};


exports.getBillsByDate = async (req, res) => {
    try {
        const { day } = req.query;
        if (!day) {
            return res.status(400).json({ error: "Date is required" });
        }

        const start = new Date(`${day}T00:00:00.000Z`);
        const end = new Date(`${day}T23:59:59.999Z`);

        const bills = await Bill.find({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }).populate("items.product");

        res.json(bills);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchBillById = async (req, res) => {
    try {

        const { q } = req.query;

        if (!q) {
            const items = await Bill.find();
            return res.json(items);
        }

        const items = await Bill.find({
            billNo: { $regex: q, $options: "i" }
        });

        res.json(items);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.downloadBill = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(req.user.id);
        const bill = await Bill.findById(id).populate("items.product");

        if (!bill) {
            return res.status(404).json({ error: "Bill not found" });
        }

        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=bill-${bill.billNo}.pdf`
        );

        doc.pipe(res);

        const startX = 50;
        const col = {
            no: startX,
            name: startX + 40,
            qty: startX + 280,
            price: startX + 340,
            subtotal: startX + 420,
        };

        const pageHeight = doc.page.height;
        const bottomMargin = 50;

        let y = 0;
        let total = 0;

        // ================= HEADER FUNCTION =================
        const drawHeader = () => {
            doc
                .fontSize(20)
                .fillColor("#1f3a93")
                .font("Helvetica-Bold")
                .text(process.env.ORGANIZATION_NAME, { align: "center" });

            doc.moveDown(0.3);

            doc
                .fontSize(11)
                .fillColor("gray")
                .text("Invento Billing & Inventory System", { align: "center" });

            doc.moveDown(0.5);

            doc
                .strokeColor("#1f3a93")
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();

            doc.moveDown(1);

            doc.fillColor("black").fontSize(10);
            doc.text(`Bill ID: ${bill.billNo}`);
            doc.text(`Bill by: ${user.name}`);
            doc.text(`Date: ${new Date(bill.createdAt).toDateString()}`);

            doc.moveDown(1.5);

            y = doc.y;
        };

        // ================= TABLE HEADER =================
        const drawTableHeader = () => {
            doc.rect(startX, y, 500, 22).fill("#2c3e50");

            doc.fillColor("white").font("Helvetica-Bold");

            doc.text("No", col.no, y + 6);
            doc.text("Product", col.name, y + 6);
            doc.text("Qty", col.qty, y + 6);
            doc.text("Price", col.price, y + 6);
            doc.text("Subtotal", col.subtotal, y + 6);

            y += 30;
        };

        // ================= PAGE BREAK CHECK =================
        const checkPageBreak = (rowHeight) => {
            if (y + rowHeight > pageHeight - bottomMargin) {
                doc.addPage();
                drawHeader();
                drawTableHeader();
            }
        };

        // ================= START =================
        drawHeader();
        drawTableHeader();

        // ================= ITEMS =================
        bill.items.forEach((item, index) => {
            const name = item.product?.name || "Unknown";
            const qty = item.quantity || 0;
            const price = item.salePriceSnapshot || 0;
            const subTotal = qty * price;

            total += subTotal;

            // dynamic height (for long names)
            const textHeight = doc.heightOfString(name, { width: 220 });
            const rowHeight = Math.max(25, textHeight + 5);

            checkPageBreak(rowHeight);

            // alternating row color
            if (index % 2 === 0) {
                doc.rect(startX, y - 5, 500, rowHeight).fill("#f4f6f7");
            }

            doc.fillColor("black").font("Helvetica");

            doc.text(index + 1, col.no, y);
            doc.text(name, col.name, y, { width: 220 });
            doc.text(qty, col.qty, y);
            doc.text(price, col.price, y);
            doc.text(subTotal, col.subtotal, y);

            y += rowHeight;
        });

        // ================= TOTAL =================
        checkPageBreak(40);

        doc.moveDown(1);

        doc
            .fontSize(12)
            .fillColor("black")
            .text("Total Amount:", 380, y + 10, { continued: true })
            .fillColor("#27ae60")
            .text(` Rs ${total}`);

        doc.end();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};