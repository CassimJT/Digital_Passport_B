import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const prescriptionSchema = new Schema({

    payer: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 500,
    
    },

    currency: {
        type: String,
        default: "MWK",
        imutable: true, 
    },

    paymentMethod: {
        type: String,
        enum: ["bank card", "mobile money", "bank transfer"],
        required: true,
    },

    transactionid: {
        type: String,
        required: true,
        unique: true,
    },

    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
    },

    description: {
        type: String,
        required: true,
    },

    //keeping track of when the payment was made
    timestamps: true, 
}); 
      

export default model("Prescription", prescriptionSchema);
