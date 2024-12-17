const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const { v4: uuidv4 } = require("uuid"); // For generating unique transaction IDs
const WithdrawalRequest = require("../models/withdrawRequestModel");

exports.addFundsToWallet = async (req, res) => {
    try {
        const { user_id, amount } = req.body;

        if (!user_id || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid user ID or amount." });
        }

        // Fetch user and update wallet balance
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Create a new transaction
        const transaction = new Transaction({
            user_id,
            transaction_id: uuidv4(),
            type: "credit",
            amount,
            status: "success",
            description: "Funds added to wallet",
        });

        // Update wallet balance
        user.walletBalance += amount;
        await user.save();
        await transaction.save();

        return res.status(200).json({
            success: true,
            message: "Funds added successfully.",
            wallet: {
                balance: user.walletBalance,
                transaction,
            },
        });
    } catch (error) {
        console.error("Error adding funds:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

exports.createWithdrawalRequest = async (req, res) => {
    try {
        const { user_id, amount } = req.body;

        if (!user_id || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid user ID or amount." });
        }

        // Fetch user to check wallet balance
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if the user has enough balance
        if (user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance." });
        }

        // Create withdrawal request
        const withdrawalRequest = new WithdrawalRequest({
            user_id,
            amount,
            status: "Pending",
        });

        await withdrawalRequest.save();

        return res.status(200).json({
            success: true,
            message: "Withdrawal request created successfully.",
            withdrawalRequest,
        });
    } catch (error) {
        console.error("Error creating withdrawal request:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

exports.getAllWithdrawRequest = async (req, res) => {
    try {
        const widrawRequests = await WithdrawalRequest.find({status:"Pending"}).populate('user_id')

        if(!widrawRequests){
            return res.status(200).json({message:"No withdraw request found"})
        }

        return res.status(200).json({message:"Withdraw request fetched successfully", data:widrawRequests})
    } catch (error) {
        console.error("Error Fetching withdrawal request:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

exports.getAllWithdrawHistory = async (req, res) => {
    try {
        const widrawHistory = await WithdrawalRequest.find({status:"Approved"}).populate('user_id')

        if(!widrawHistory){
            return res.status(200).json({message:"No withdraw request found"})
        }

        return res.status(200).json({message:"Withdraw history fetched successfully", data:widrawHistory})
    } catch (error) {
        console.error("Error Fetching withdrawal history:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

exports.handleWithdrawalRequest = async (req, res) => {
    try {
        const { request_id, status, rejection_reason } = req.body;

        if (!request_id || !status || (status === "Rejected" && !rejection_reason)) {
            return res.status(400).json({ success: false, message: "Invalid input." });
        }

        // Fetch withdrawal request
        const withdrawalRequest = await WithdrawalRequest.findById(request_id).populate("user_id");
        if (!withdrawalRequest) {
            return res.status(404).json({ success: false, message: "Withdrawal request not found." });
        }

        // Check if the request is already processed
        // if (withdrawalRequest.status !== "pending") {
        //     return res.status(400).json({ success: false, message: "This request has already been processed." });
        // }

        // Handle approval or rejection
        if (status === "Approved") {
            // Update user wallet balance
            const user = withdrawalRequest.user_id;
            user.walletBalance -= withdrawalRequest.amount; // Deduct amount from wallet balance
            await user.save();

            // Update withdrawal request status
            withdrawalRequest.status = "Approved";
            withdrawalRequest.approved_date = Date.now();
        } else if (status === "Rejected") {
            // Update withdrawal request status and add rejection reason
            withdrawalRequest.status = "Rejected";
            withdrawalRequest.rejection_reason = rejection_reason;
        }

        // Save the withdrawal request
        await withdrawalRequest.save();

        return res.status(200).json({
            success: true,
            message: `Withdrawal request ${status} successfully.`,
            withdrawalRequest,
        });
    } catch (error) {
        console.error("Error handling withdrawal request:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        // Fetch all transactions for the user
        const transactions = await Transaction.find({ user_id }).sort({ date: -1 });
        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ success: false, message: "No transactions found." });
        }

        return res.status(200).json({
            success: true,
            message: "Transaction history fetched successfully.",
            transactions,
        });
    } catch (error) {
        console.error("Error fetching transactions:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
