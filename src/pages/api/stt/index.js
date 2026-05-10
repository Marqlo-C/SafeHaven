const { requireAuth } = require('../../../lib/requireAuth');
const { parseUpload } = require('../../../lib/multerHelper');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const appConfig = require('../../../config/config');

export const config = {
  api: {
    bodyParser: false, // Disables body parsing so multer can handle it
  },
};

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = appConfig.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ error: 'STT service not configured.' });
  }

  try {
    // 1. Parse the multipart/form-data upload
    await parseUpload(req, res);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }

    // 2. Forward the file to ElevenLabs
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname || 'audio.wav');
    formData.append('model_id', 'scribe_v1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[STT] ElevenLabs error:', data);
      return res.status(response.status).json({ error: 'Failed to process audio.' });
    }

    // ElevenLabs STT response structure: { text: "...", ... }
    return res.status(200).json({ transcript: data.text });
  } catch (err) {
    console.error('[STT] Internal error:', err);
    return res.status(500).json({ error: 'Internal server error during transcription.' });
  }
});
