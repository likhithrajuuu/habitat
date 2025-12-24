const axiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

const axios = {
  create: jest.fn(() => axiosInstance),
  ...axiosInstance,
};

module.exports = axios;
module.exports.default = axios;
