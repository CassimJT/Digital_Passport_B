import pkg from 'joi';
const { date, object } = pkg;
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const nrbSchema = new Schema({

    // part one of National Registration Bureau (NRB) form (Narional ID applicant Details)
    nationality: {
        type: String,
        required: true,
        unique: true,
    }, 
    
    secondNationality: {
        type: String,
        required: false,
    },
    
    dateOfBirth: {
        type: date,
        required: true,
        trim: true,
    },

    sex: {
        type : String,
        required: true,
        enum:["male", "female"],
        trim: true,
    },

    //homeaddress
    placeOfBirth: {
        district: {type: String,required: true,trim: true,},
        traditionalauthority: {type: String,required: true,trim: true,},
        village: {type: String,required: true,trim: true,},
    },
    
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    
    middleName: {
        type: String,
        required: false,
        trim: true,
    },

    surName: {
        type: String,
        required: true,
        trim: true,
    },
    
    maritalStatus: {
        type: String,
        required: true,
        enum:["never married", "married", "divorced", "widowed", "separated", "abandoned"],
        trim: true,
    },
    colourOfEyes: {
        type: String,
        required: true,
        trim: true,
    },
    mobilePhone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    emailAddress: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    //Residential address
    residentialAddress: {
        district: {type: String,required: true,trim: true,},
        traditionalauthority: {type: String,required: true,trim: true,},
        village: {type: String,required: true,trim: true,},
    },
    //the national id number
    nationalId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    }

});

export default model("NRB", nrbSchema);
