import Payment from "../models/Payment.mjs";
import { pcFetch } from "../utils/helpers.mjs";

//logic to initialize the payment
export const initPayment = async (req,res)=> {
  try {
    const { amount, paymentMethod, description, currency = "MWK", callback_url, return_url } = req.body;
    if (!amount || !paymentMethod || !description || !callback_url || !return_url)
      return res.status(400).json({ message: "Missing required fields" });

    const transactionid = `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const payload = { amount: amount.toString(), currency, callback_url, return_url, tx_ref: transactionid };

    const data = await pcFetch("/payment", { method: "POST", body: JSON.stringify(payload) });

    await Payment.create({ payer: req.user?._id, amount, currency, paymentMethod, transactionid, description, status: "pending" });

    return res.status(200).json({ status: "success", message: "Payment initialized", checkout_url: data.data.checkout_url });
  } catch (error) {
    console.error("initPayment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//logic to get payment by User
export const getPaymentsByUser = async (req,res)=> {
  try {
    const payments = await Payment.find({ payer: req.params.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ status: "success", message: "Payments fetched", data: payments });
  } catch (error) {
    console.error("getPaymentsByUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//logic to get payment by Id
export const getPaymentById = async (req,res)=> {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ status: "success", message: "Payment fetched", data: payment });
  } catch (error) {
    console.error("getPaymentById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//webhook logic
export const webhookHandler = async (req,res)=> {
  try {
    const event = JSON.parse(req.body.toString());
    if (!event?.data?.tx_ref) return res.status(400).json({ message: "Invalid payload" });

    const payment = await Payment.findOne({ transactionid: event.data.tx_ref });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = event.data.status || payment.status;
    await payment.save();

    return res.status(200).json({ status: "success", message: "Webhook processed" });
  } catch (error) {
    console.error("webhookHandler:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//logic to verify payment
export const verify = async (req,res)=> {
  try {
    const { transactionid } = req.query;
    if (!transactionid) return res.status(400).json({ message: "Transaction ID required" });

    const data = await pcFetch(`/verify-payment/${transactionid}`);
    const payment = await Payment.findOneAndUpdate({ transactionid }, { status: data.data.status }, { new: true });

    return res.status(200).json({ status: "success", message: "Payment verified", data: payment });
  } catch (error) {
    console.error("verify:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//logic to cancel pyment
export const cancelPayment = async (req,res)=> {
  try {
    const { transactionid } = req.body;
    if (!transactionid) return res.status(400).json({ message: "Transaction ID required" });

    const payment = await Payment.findOne({ transactionid });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = "failed";
    await payment.save();

    return res.status(200).json({ status: "success", message: "Payment cancelled" });
  } catch (error) {
    console.error("cancelPayment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
