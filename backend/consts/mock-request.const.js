const mockRequest = (body = {}, params = {}, query = {}, headers = {}) => {
    return {
        body,
        params,
        query,
        headers,
        header: jest.fn((headerName) => headers[headerName]),
    };
};

module.exports = mockRequest;