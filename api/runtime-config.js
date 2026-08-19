// Vercel serverless endpoint: Google Maps browser keys are public by design,
// but must be restricted to this deployment's HTTP referrers in Google Cloud.
module.exports = function runtimeConfig(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.status(200).json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });
};
