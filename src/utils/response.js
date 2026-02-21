function successRes(res, statusCode, data) {
  return res.status(statusCode).json({
    success: true,
    ...(data !== undefined && { data }),
  });
}

module.exports = { successRes };
