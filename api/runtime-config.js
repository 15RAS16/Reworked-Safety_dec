// Vercel serverless endpoint: MapTiler browser keys are public by design,
// but must be restricted to the deployment's allowed origins in MapTiler Cloud.
module.exports = function runtimeConfig(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.status(200).json({
    mapTilerApiKey: process.env.MAPTILER_API_KEY || process.env.VITE_MAPTILER_API_KEY || ''
  });
};
