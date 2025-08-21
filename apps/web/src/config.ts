// Validate required environment variables
function validateEnv() {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error(
      '❌ Missing required environment variable: VITE_API_URL\n' +
        'Please check your .env file and ensure VITE_API_URL is set.'
    );
  }

  return {
    apiUrl,
    appUrl: import.meta.env.VITE_APP_URL || window.location.origin,
  };
}

export const config = validateEnv();
