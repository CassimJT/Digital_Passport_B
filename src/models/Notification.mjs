import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const notificationSchema = new Schema({
    user: { 
        type: Types.ObjectId, 
        ref: User,
        required: true,
    },

    type: {
        type: String,
        enum: ["info", "error", "success"],
        default: 'info',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true, 
    },

    message: { 
        type: String, 
        required: true,
        trim: true, 
    },

    read: { 
    type: Boolean, 
    default: false,
    required: true
  },
  //link associated with the notification
  link: {
    type: String,
    default: null,
    trim: true,
  },
    createdAt: {    
        type: Date, 
        default: Date.now,
    }
});

export default model("Notification", notificationSchema);
