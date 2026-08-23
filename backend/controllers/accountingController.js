// backend/controllers/accountingController.js
const Transaction = require("../models/Transaction");

// 1. Get All Financial Ledger Entries
const getAllTransactions = async (req, res) => {
  try {
    const { type, category } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Add New Transaction (Income / Expense)
const createTransaction = async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      amount,
      paymentMethod,
      date,
      referenceNo,
      remarks,
    } = req.body;

    if (!title || !type || !amount) {
      return res.status(400).json({
        success: false,
        message: "Title, type, and amount are required.",
      });
    }

    const transaction = await Transaction.create({
      title,
      type,
      category: category || "Other",
      amount: Number(amount),
      paymentMethod: paymentMethod || "Bank Transfer",
      date: date ? new Date(date) : new Date(),
      referenceNo: referenceNo || `TXN-${Date.now().toString().slice(-6)}`,
      remarks: remarks || "",
    });

    return res.status(201).json({
      success: true,
      message: "Transaction logged in ledger successfully.",
      data: transaction,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Overall Financial Summary
const getFinancialSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((txn) => {
      if (txn.type === "Income") {
        totalIncome += txn.amount;
      } else if (txn.type === "Expense") {
        totalExpense += txn.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        totalEntries: transactions.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
  getFinancialSummary,
};
