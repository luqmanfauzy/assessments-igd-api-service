const buildResponse = (success, message, data = null, meta = null) => ({
  success,
  message,
  data,
  meta
});

export {
  buildResponse
};
