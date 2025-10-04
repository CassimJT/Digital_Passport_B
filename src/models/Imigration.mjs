import mongoose from "mongoose";
//import { interpolators } from "sharp";
const { Schema, model, Types } = mongoose;

const imigration = new Schema({
  //passport, servec and Booklet type
    passportType: { 
        type: String,
        enum: ["ordinary", "diplomatic", "service", "mirror"], 
        required: true 
    },

    serviceType: {
        type: String,
        enum: ["normal", "Express", "urgent",],
        required: true,
    },
    bookletType: {
        type: String,
        enum: ["36-pages", "48-pages",],
        required: true,
        trim: true,
    },
    //Personal information
    nationalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Nrb,
        required: true,
        unique: true,
    },

    occupation: {
        type: String,
        required: false,
        trim: true,
    },

    height: {
        type: int,
        required: true,

    },
    //Fathers place of Origin
    placeOfBirth: {
        district: {type: String,required: true,trim: true,},
        traditionalauthority: {type: String,required: true,trim: true,},
        village: {type: String,required: true,trim: true,},
    },

    //Mother place of Origin
    mothersPlaceOfBirth: {
        district: {type: String,required: true,trim: true,},
        traditionalauthority: {type: String,required: true,trim: true,},
        village: {type: String,required: true,trim: true,},
    },


});

export default model("Imigration", imigration);
