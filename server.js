const { loadEnvConfig } = require('@next/env');
const express = require('express');
const next = require('next');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dbConnect = require('./lib/db');
const Memory = require('./models/Memory');
const { ensureAdmin } = require('./lib/helpers');

loadEnvConfig(process.cwd());

const dev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT || 3000);
const app = next({ dev });
const handle = app.getRequestHandler();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || process.env.CLOUDINARY_FOLDER || 'year-of-memories',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(cors());
    server.use(express.json({ limit: '10mb' }));

    server.get('/api/health', (_req, res) => {
      res.json({ ok: true });
    });

    server.get('/api/memories', async (_req, res) => {
      try {
        await dbConnect();
        const memories = await Memory.find({}).sort({ order: 1, createdAt: 1 }).lean();
        res.json(memories);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to load memories.' });
      }
    });

    server.post('/api/memories', ensureAdmin, async (req, res) => {
      try {
        await dbConnect();
        if (!req.body.audioUrl) {
          return res.status(400).json({ error: 'Audio URL is required.' });
        }

        const memory = await Memory.create({
          mediaType: req.body.mediaType,
          mediaUrl: req.body.mediaUrl,
          audioUrl: req.body.audioUrl,
          songIconUrl: req.body.songIconUrl || '',
          paragraph: req.body.paragraph,
          title: req.body.title,
          caption: req.body.caption,
          order: Number(req.body.order)
        });

        return res.status(201).json(memory);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Unable to save memory.' });
      }
    });

    server.post('/api/upload', ensureAdmin, upload.single('media'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No media file received.' });
        }
        if (!hasCloudinaryConfig()) {
          return res.status(500).json({
            error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.'
          });
        }

        const uploaded = await uploadToCloudinary(req.file);

        return res.status(201).json({
          mediaUrl: uploaded.secure_url,
          mediaType: uploaded.resource_type === 'video' ? 'video' : 'image',
          publicId: uploaded.public_id
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error?.message || 'Cloud upload failed.' });
      }
    });

    server.post('/api/upload-audio', ensureAdmin, upload.single('audio'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No audio file received.' });
        }
        if (!hasCloudinaryConfig()) {
          return res.status(500).json({
            error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.'
          });
        }
        if (!req.file.mimetype?.startsWith('audio/')) {
          return res.status(400).json({ error: 'Only audio files are allowed.' });
        }

        const uploaded = await uploadToCloudinary(req.file, `${process.env.CLOUDINARY_FOLDER || 'year-of-memories'}/audio`);

        return res.status(201).json({
          audioUrl: uploaded.secure_url,
          publicId: uploaded.public_id
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error?.message || 'Audio upload failed.' });
      }
    });

    server.all('*', (req, res) => handle(req, res));

    server.listen(port, () => {
      console.log(`> Server ready on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Server boot failed', error);
    process.exit(1);
  });
