export const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const successResponse = (res, status, data = {}, message) => {
  return res.status(status).json({ success: true, ...data, message });
};
