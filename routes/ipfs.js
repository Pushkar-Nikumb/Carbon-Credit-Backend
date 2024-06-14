const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();
const Organization = require('../model/organization');

const uploadToIPFS = async (filePath, fileName, req, res) => {
  const formData = new FormData();
  const file = fs.createReadStream(filePath);
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: fileName,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const ipfsResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${process.env.JWT}`,
        },
      }
    );

    console.log(ipfsResponse.data);

    res.status(200).json({
      success: true,
      message: 'Image uploaded to Pinata IPFS successfully.',
      ipfsResponse: ipfsResponse.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image to Pinata IPFS.',
      error: error.message,
    });
  }
};

router.post('/ipfs', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File not received from the client!',
    });
  }

  const { path: filePath, originalname: fileName } = req.file;

  try {
    const orgDataExists = await Organization.findOne({
      _id: req.body.organizationalID,
    });

    if (orgDataExists) {
      console.log('in try block');
      uploadToIPFS(filePath, fileName, req, res);
    } else {
      res.status(404).json({ success: false, message: 'Organization not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
