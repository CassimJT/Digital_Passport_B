import { required } from "joi";
import mongoose from "mongoose";
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
    firstName: { 
        type: String, 
        required: true, 
        trim: true,
    },
    surnName: { 
        type: String, 
        required: true,
        trim: true,
     },
    middleName: { 
        type: String, 
        required: true, 
        trim: true 
    },

    dateOfBirth: {
        type: Date,
        require: true,
    },

    country: {
        type: String,
        required: true,
        trim: true,
    },
    occupation: {
        type: String,
        required: false,
        trim: true,
    },


});

export default model("Imigration", imigration);
