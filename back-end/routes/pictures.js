const express = require("express")
const mongoose = require("mongoose")
const path = require('path'); 
const app = express()
const router = express.Router();
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
// const sharp = require('sharp');


// Configuration de GridFSStorage
const storage = new GridFsStorage({
    url: process.env.MONGOLAB_URI,
    file: (req, file) => {
        console.log(file)
        try{
            return {
                filename: file.originalname,
                bucketName: 'uploads',
              };
        }catch(err){
            console.log("err")
        }
     
      
    },
  });

  storage.on('connection', (db) => {
    console.log('GridFS storage connected');
  });
  
  storage.on('connectionFailed', (err) => {
    console.error('GridFS storage connection failed', err);
  });
  
  const upload = multer({ storage });


  // Schéma Mongoose pour l'image
  const imageSchema = new mongoose.Schema({
    author: String,
    filename: String,
    contentType: String,
    imageId: mongoose.Schema.Types.ObjectId,
    description: String,
    hashtags: [String],
    uploadDate: { type: Date, default: Date.now },
  });
  
  const Image = mongoose.model('Image', imageSchema);
  
  // POST endpoint for uploading an image without additional processing
  router.post('/upload',  upload.single("image"), async (req, res) => {
    console.log("uploading image")
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
    try {
      const { author, description, hashtags } = req.body;
        console.log(req)
      const newImage = new Image({
        author,
        filename: req.file.filename,
        contentType: req.file.mimetype,
        imageId: req.file.id,
        description,
        hashtags: hashtags.split(','),
      });
  
      await newImage.save();
      res.json(newImage);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

   // Route pour obtenir les images
   router.get('/pictures', async (req, res) => {
    try {
      const pictures = await Image.find().sort({ uploadDate: -1 }).limit(10);
      res.json(pictures);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

   //route pour obtenir les images par hashtags
   router.get('/userPictures', async (req, res) => {
    try {
    const pictures = await Image.find({ username: req.params.username});
    res.json(pictures);
    } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
    }
});

  //route pour obtenir les images par hashtags
    router.get('/pictures/:hashtag', async (req, res) => {
        try {
        const regex = new RegExp(req.params.hashtag, 'i');
        const pictures = await Image.find({ hashtags: {$regex: regex}});
        res.json(pictures);
        } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
        }
    });

    // Route pour supprimer les images
router.delete('/pictures/:id', async (req, res) => {
    try {
      await Image.findOneAndDelete({imageId: req.params.id});
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
    });


 // Route pour mettre à jour les images
 router.put('/pictures/:id', async (req, res) => {
    try {
      const { description, hashtags } = req.body;
      console.log("description",req.params.id)
      const updatedImage = await Image.findOneAndUpdate({imageId: req.params.id}, {
        description,
        hashtags,
      });
      console.log("updatedImage",updatedImage)
      res.json(updatedImage);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

// GET endpoint for retrieving a single photo
router.get('/image/:id', async (req, res) => {
    try {
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
  
      downloadStream.on('data', (chunk) => {
        res.write(chunk);
      });
  
      downloadStream.on('error', (err) => {
        res.status(404).send('Image not found');
      });
  
      downloadStream.on('end', () => {
        res.end();
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

// GET endpoint for downloading a single image
router.get('/download/:id', async (req, res) => {
    try {
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  
      // Fetch the image details first to set a proper filename in the Content-Disposition header
      const image = await Image.findOne({ imageId: req.params.id });
      if (!image) {
        return res.status(404).send('Image not found');
      }
  
      // Set headers to prompt download with the original filename
      res.set('Content-Type', image.contentType);
      res.set('Content-Disposition', 'attachment; filename="' + image.filename + '"');
  
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
  
      downloadStream.on('data', (chunk) => {
        res.write(chunk);
      });
  
      downloadStream.on('error', (err) => {
        console.error(err);
        res.status(404).send('Image not found');
      });
  
      downloadStream.on('end', () => {
        res.end();
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  module.exports = router;