// jest.setup.js or directly in the test file
jest.mock('../config/prisma', () => {
    return {
        user: {
            findUnique: jest.fn(),
        },
    };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const { login, authenticate } = require('../controllers/auth.controller');
const mockRequest = require('../consts/mock-request.const');
const mockResponse = require('../consts/mock-response.const');


describe('login function', () => {
    test('should return 401 if email does not exist', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const req = mockRequest({ email: 'test@example.com', password: 'password123' });
        const res = mockResponse();

        await login(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ message: "email atau password salah" });
    });

    test('should return 401 if password does not match', async () => {
        const mockUser = { id: 1, email: 'test@example.com', password: 'hashedpassword' };
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcrypt.compareSync.mockReturnValue(false);

        const req = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
        const res = mockResponse();

        await login(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ message: "email atau password salah" });
    });

    test('should return 200 and a token if credentials are correct', async () => {
        const mockUser = { id: 1, email: 'test@example.com', password: 'hashedpassword' };
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcrypt.compareSync.mockReturnValue(true);
        jsonwebtoken.sign.mockReturnValue('fake-jwt-token');

        const req = mockRequest({ email: 'test@example.com', password: 'password123' });
        const res = mockResponse();

        await login(req, res);

        expect(res.json).toBeCalledWith({ token: 'fake-jwt-token' });
    });

    // test('should return 500 if there is an error', async () => {
    //     prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

    //     const req = mockRequest({ email: 'test@example.com', password: 'password123' });
    //     const res = mockResponse();

    //     await login(req, res);

    //     expect(res.status).toBeCalledWith(500);
    //     expect(res.json).toBeCalledWith({ error: 'Database error' });
    // });
});


describe('authenticate function', () => {
    test('should return 401 if no token is provided', async () => {
        const req = mockRequest({}, {}, {}, { Authorization: '' });
        const res = mockResponse();

        await authenticate(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ msg: 'No token, authorization denied' });
    });

    test('should return 401 if token is invalid', async () => {
        jsonwebtoken.verify.mockImplementation(() => { throw new Error('Invalid token') });

        const req = mockRequest({}, {}, {}, { Authorization: 'Bearer invalid.token' });
        const res = mockResponse();

        await authenticate(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({ msg: 'Token is not valid' });
    });

    test('should return 403 if token is expired or malformed', async () => {
        jsonwebtoken.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Token expired'), null);
        });

        const req = mockRequest({}, {}, {}, { Authorization: 'Bearer expired.token' });
        const res = mockResponse();

        await authenticate(req, res);

        expect(res.sendStatus).toBeCalledWith(403);
    });

    test('should return 200 and the user info if token is valid', async () => {
        const mockUser = { id: 1, email: 'test@example.com' };
        jsonwebtoken.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser);
        });

        const req = mockRequest({}, {}, {}, { Authorization: 'Bearer valid.token' });
        const res = mockResponse();

        await authenticate(req, res);

        expect(res.json).toBeCalledWith(mockUser);
    });
});
