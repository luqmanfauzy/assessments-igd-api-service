const timestamp = () => new Date().toISOString();

const logger = {
  info: (message) => console.log(`[${timestamp()}] INFO: ${message}`),
  warn: (message) => console.warn(`[${timestamp()}] WARN: ${message}`),
  error: (message, error) => console.error(`[${timestamp()}] ERROR: ${message}`, error || '')
};

export default logger;
