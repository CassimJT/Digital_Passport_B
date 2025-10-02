
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import sharp from "sharp";

const PAYCHANGU_API = "https://api.paychangu.com";
const SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY;

// Capitalize first letter of a string
export const capitalize = (str) => {
  
};

// Format a user's full name
export const formatFullName = (user) => {
 
};

// Format date to YYYY-MM-DD string
export const formatDate = (date) => {

};

// Mask an email for privacy 
export const maskEmail = (email) => {
  
};

// Generate random code (e.g., for OTPs or IDs)
export const generateRandomCode = (length = 6) => {

};

// Check if user has a given role
export const hasRole = (user, roles = []) => {
  
};

//hash the password
export const hashPassword = async (password) => {
   
};
//copare the raw and hashed password
export const comparePassword = async (raw, hashed) => {
    
};

// Validate if a string is a valid ObjectId
export const validateObjectId = (id, fieldName = "ID") => {

};

//geting the expiration date from jwt
export const getExpiryDate = (token) => {
  
};

//optimise image
export const optimizeImage = async (filePath) => {
 
};
// Helper: call PayChangu
export const pcFetch = async (path, init = {}) => {
  const res = await fetch(`${PAYCHANGU_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${SECRET_KEY}`, // Secret Key
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  // Get raw text and parse JSON safely
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Invalid JSON from PayChangu:", text);
    throw new Error(`Invalid response from PayChangu: ${text.substring(0, 100)}`);
  }

  // Log full response for debugging
  if (!res.ok) {
    console.error("PayChangu API Error:", {
      status: res.status,
      body: data,
    });

    // Extract readable error message
    let errorMsg =
      data?.message ||
      (typeof data?.error === "string" ? data.error : null) ||
      (data?.errors ? JSON.stringify(data.errors) : null) ||
      `PayChangu error (${res.status})`;

    throw new Error(errorMsg);
  }

  return data;
};
