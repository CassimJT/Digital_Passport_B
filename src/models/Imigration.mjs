import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const imigration = new Schema({
  //passport, service and Booklet type
   client: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
   },
    passportType: { 
        type: String,
        enum: ["ordinary", "diplomatic", "service", "mirror"], 
        required: true 
    },

    serviceType: {
        type: String,
        enum: ["normal", "Express", "urgent"],
        required: true,
    },
    bookletType: {
        type: String,
        enum: ["36-pages", "48-pages"],
        required: true,
        trim: true,
    },
    //Personal information
    nationalId: {
        type: Types.ObjectId, 
        ref: "Nrb",
        required: true,
        unique: true,
    },

    occupation: {
        type: String,
        required: false,
        trim: true,
    },

    height: {
        type: Number, 
        required: true,
        min: 0 
    },
    //Fathers place of Origin
    placeOfBirth: {
        district: {type: String, required: true, trim: true},
        traditionalauthority: {type: String, required: true, trim: true},
        village: {type: String, required: true, trim: true},
    },

    //Mother place of Origin
    mothersPlaceOfBirth: {
        district: {type: String, required: true, trim: true},
        traditionalauthority: {type: String, required: true, trim: true},
        village: {type: String, required: true, trim: true},
    },  
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
});

export default model("Immigration", imigration);