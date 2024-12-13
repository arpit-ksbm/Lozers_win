const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const { AuthSandbox } = require('../config/authKyc');
const Aadhar = require('../models/AadharModel');
const Pan = require('../models/PanModel');
require('dotenv').config();

const APiKey = process.env.KYC_API_KEY;

exports.AadharOtp = async function (req, res) {
    try {
        const { aadhaar_number, userId } = req.body;

        if (!aadhaar_number || !userId) {
            return res.status(400).json({ error: 'aadhaar_number and userId are required.' });
        }

        const existingAadhar = await Aadhar.findOne({ userId, aadhaar_number });
        if (existingAadhar) {
            return res.status(200).json({
                error: 'A PAN entry already exists for this userId and pan combination.',
            });
        }
        
        const Token = await AuthSandbox();

        const response = await axios.post(
            'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp',
            {
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
                aadhaar_number,
                consent: 'y',
                reason: "Verification",
            },
            {
                headers: {
                    accept: 'application/json',
                    authorization: `${Token}`,
                    'content-type': 'application/json',
                    'x-api-key': APiKey,
                    'x-api-version': '2.0',
                },
            }
        );


        if (response.data.code === 200) {
            const newAadhar = new Aadhar({
                userId,
                aadhaar_number,
                reference_id: response.data?.data?.reference_id,
                status: 'not_verified',
            });
            await newAadhar.save();

            return res.status(200).json({ message: 'OTP sent successfully.', data: response.data });
        } else {
            return res.status(response.data.code).json({ error: response.data.message });
        }
    } catch (error) {
        console.error(error);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.verifyAadharOtp = async function (req, res) {
    try {
        const { otp, userId } = req.body;

        if (!otp || !userId) {
            return res.status(400).json({ error: 'otp and userId are required.' });
        }

        const aadharRecord = await Aadhar.findOne({ userId });
        console.log(aadharRecord, "aadharRecord");
        
        if (!aadharRecord) {
            return res.status(404).json({ error: 'Aadhar record not found for the provided userId.' });
        }

        const reference_id = aadharRecord?.reference_id;
        console.log(reference_id,"reference_id");
        

        const Token = await AuthSandbox();

        const response = await axios.post(
            'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify',
            {
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
                reference_id,
                otp,
            },
            {
                headers: {
                    accept: 'application/json',
                    authorization: `${Token}`,
                    'content-type': 'application/json',
                    'x-api-key': APiKey,
                    'x-api-version': '2.0',
                },
            }
        );

        if (response.data.code === 200) {
            const updatedAadhar = await Aadhar.findOneAndUpdate(
                { userId },
                { status: 'verified' },
                { new: true }
            );

            return res.status(200).json({ message: 'Aadhaar OTP verified successfully.', data: updatedAadhar });
        } else {
            return res.status(response.data.code).json({ error: response.data.message });
        }
    } catch (error) {
        console.error(error);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.verifyPan = async function (req, res) {
    try {
        const { userId, pan, name_as_per_pan, date_of_birth } = req.body;

        if (!userId || !pan || !name_as_per_pan || !date_of_birth) {
            return res.status(400).json({ error: 'userId, pan, name_as_per_pan, and date_of_birth are required.' });
        }

        const existingPan = await Pan.findOne({ userId, pan });
        if (existingPan) {
            return res.status(200).json({
                error: 'A PAN entry already exists for this userId and pan combination.',
            });
        }

        const Token = await AuthSandbox();

        const response = await axios.post(
            'https://api.sandbox.co.in/kyc/pan/verify',
            {
                "@entity": "in.co.sandbox.kyc.pan_verification.request",
                pan,
                name_as_per_pan,
                date_of_birth,
                consent: "y",
                reason: "for testing",
            },
            {
                headers: {
                    accept: 'application/json',
                    authorization: `${Token}`,
                    'content-type': 'application/json',
                    'x-api-key': APiKey,
                    'x-api-version': '2.0',
                    'x-accept-cache': 'true',
                },
            }
        );

        if (response.data.code === 200) {
            const newPan = new Pan({
                userId,
                pan,
                name_as_per_pan,
                date_of_birth,
                status: 'verified',
            });

            await newPan.save();

            return res.status(200).json({
                message: 'PAN verified successfully.',
                data: response.data,
            });
        } else {
            return res.status(response.data.code).json({
                error: response.data.message,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.verifyBank = async function (req, res) {
    try {
        const { ifsc, account_number,name, mobile } = req.body;

        if (!ifsc || !account_number) {
            return res.status(400).json({
                message: 'IFSC and Account Number are required.'
            });
        }

        const Token = await AuthSandbox();

        const headers = {
            'accept': 'application/json',
            'authorization': `${Token}`,
            'content-type': 'application/json',
            'x-api-key': APiKey,
            'x-api-version': '2.0'
        };

        // Send the request to the sandbox bank verification API
        const response = await axios.get(
            `https://api.sandbox.co.in/bank/${ifsc}/accounts/${account_number}/verify`, 
            {
                headers: headers,
                params: { 
                    name: name,
                    mobile: mobile
                }
            }
        );

        return res.status(200).json({
            message: 'Bank verification successful.',
            data: response.data
        });

    } catch (error) {
        console.error(error);
        return res.status(error.response?.status || 500).json({
            error: error.message || 'An error occurred during the verification process.'
        });
    }
};



