import { date, required } from "joi";
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const nrbSchema = new Schema({

    // part one of National Registration Bureau (NRB) form (Narional ID applicant Details)
    nationality: {
        type: String,
        required: true,
        unique: true,
    }, 
    
    secondnationality: {
        type: String,
        required: false,
    },
    
    dateofbirth: {
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
    placeofbirth: {
        district: {type: String,required: true,trim: true,},
        traditionalauthority: {type: String,required: true,trim: true,},
        village: {type: String,required: true,trim: true,},
    },
    
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    
    middlename: {
        type: String,
        required: false,
        trim: true,
    },

    surname: {
        type: String,
        required: true,
        trim: true,
    },
    
    maritalstatus: {
        type: String,
        required: true,
        enum:["never married", "married", "divorced", "widowed", "separated", "abandoned"],
        trim: true,
    },
    colourofeyes: {
        type: String,
        required: true,
        trim: true,
    },
    mobilephone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    emailaddress: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    //Residential address
    residentialaddress: {
        district: {type: String,required: true,trim: true,},
        traditionalauthority: {type: String,required: true,trim: true,},
        village: {type: String,required: true,trim: true,},
    },


    nationalid: {
        type: String,
        required: true,
        unique: true,
        trim: true, 
    },

});

export default model("NRB", nrbSchema);
