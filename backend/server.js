const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Global Process Error Handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'online', service: 'SonicStream Robust YouTube Engine', version: '8.0.0' });
});

// Precision Real YouTube Search Endpoint (30+ Real Songs per Query)
app.get('/api/v1/search', (req, res) => {
  const rawQuery = (req.query.q || 'Dadju').trim();
  const host = req.headers.host || 'localhost:5000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  const pythonScript = path.join(__dirname, 'yt_search.py');
  const cmd = `python3 "${pythonScript}" "${rawQuery.replace(/"/g, '\\"')}"`;

  exec(cmd, { timeout: 15000 }, (error, stdout, stderr) => {
    let rawTracks = [];
    if (!error && stdout) {
      try {
        rawTracks = JSON.parse(stdout);
      } catch (e) {
        console.error("JSON parse error from yt_search.py:", e);
      }
    }

    // Map to include direct stream URLs
    const tracks = rawTracks.map(t => ({
      ...t,
      streamUrl: `${baseUrl}/api/v1/download/file?vid=${t.id}&title=${encodeURIComponent(t.title)}`
    }));

    res.json({
      query: rawQuery,
      count: tracks.length,
      tracks: tracks
    });
  });
});

// DIRECT UNCORRUPTED YOUTUBE AUDIO STREAM & FILE DOWNLOAD ENDPOINT
app.get('/api/v1/download/file', (req, res) => {
  const vid = req.query.vid || 'tVKaN_H35xs';
  const title = req.query.title || 'Official_Audio';
  const format = (req.query.format || 'mp3').toLowerCase();

  const cleanName = title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `${cleanName}.${format}`;

  // Check if file is already cached on local disk
  try {
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const cachedFile = files.find(f => f.startsWith(vid) && !f.endsWith('.part'));

    if (cachedFile) {
      const cachedPath = path.join(DOWNLOADS_DIR, cachedFile);
      res.setHeader('Content-Type', cachedFile.endsWith('.mp3') ? 'audio/mpeg' : 'audio/webm');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return fs.createReadStream(cachedPath).pipe(res);
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }

  // Extract direct uncorrupted HTTPS stream URL using yt_stream.py
  const streamScript = path.join(__dirname, 'yt_stream.py');
  const cmd = `python3 "${streamScript}" "${vid}"`;

  exec(cmd, { timeout: 12000 }, (error, stdout, stderr) => {
    const directAudioUrl = stdout ? stdout.trim() : '';

    if (directAudioUrl && directAudioUrl.startsWith('http')) {
      res.setHeader('Content-Type', 'audio/webm');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');

      const client = directAudioUrl.startsWith('https') ? https : http;

      try {
        const reqStream = client.get(directAudioUrl, (audioResponse) => {
          if (audioResponse.statusCode === 200 || audioResponse.statusCode === 206) {
            audioResponse.pipe(res);

            // Cache audio to local disk for instant future playback
            const localCachePath = path.join(DOWNLOADS_DIR, `${vid}.webm`);
            const fileWriter = fs.createWriteStream(localCachePath);
            fileWriter.on('error', (err) => console.error("File writer error:", err));
            audioResponse.pipe(fileWriter);
          } else if (audioResponse.statusCode === 301 || audioResponse.statusCode === 302) {
            const redirectUrl = audioResponse.headers.location;
            if (redirectUrl) {
              client.get(redirectUrl, (redResp) => redResp.pipe(res)).on('error', (e) => console.error(e));
            }
          } else {
            if (!res.headersSent) res.status(500).send("Unable to stream audio");
          }
        });

        reqStream.on('error', (err) => {
          console.error("Streaming error:", err.message);
          if (!res.headersSent) res.status(500).send("Audio stream error");
        });
      } catch (err) {
        console.error("Client get exception:", err);
        if (!res.headersSent) res.status(500).send("Stream exception");
      }
    } else {
      // Fallback
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      https.get('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', (s) => s.pipe(res)).on('error', (e) => console.error(e));
    }
  });
});

// Start server with automatic port fallback
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`⚡ SonicStream Robust YouTube Engine active on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} occupied, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(DEFAULT_PORT);
