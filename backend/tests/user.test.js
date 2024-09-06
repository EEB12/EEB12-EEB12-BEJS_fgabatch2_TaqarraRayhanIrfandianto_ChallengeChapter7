jest.mock('../config/prisma', () => {
    return {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getUsers, getUserById, getUserInfo, createUser } = require('../controllers/user.controller');
const mockRequest = require('../consts/mock-request.const');
const mockResponse = require('../consts/mock-response.const');


describe('getUsers function', () => {
    test('should return 200 with the list of users', async () => {
        const mockUsers = [
            { id: 1, name: 'test test', email: 'test@example.com', profile: { identity_type: 'ID', identity_number: '1234' }, bank_account: [] },
        ];
        prisma.user.findMany.mockResolvedValue(mockUsers);

        const req = mockRequest();
        const res = mockResponse();

        await getUsers(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(mockUsers);
    });

    test('should return 500 if there is an error', async () => {
        prisma.user.findMany.mockRejectedValue(new Error('Database error'));

        const req = mockRequest();
        const res = mockResponse();

        await getUsers(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});

describe('getUserById function', () => {
    test('should return 200 with the user data if found', async () => {
        const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', profile: { identity_type: 'ID', identity_number: '1234' }, bank_account: [] };
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getUserById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(mockUser);
    });

    test('should return 400 if user not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getUserById(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'User not found' });
    });

    test('should return 500 if there is an error', async () => {
        prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getUserById(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});


describe('getUserInfo function', () => {
    test('should return 200 with the user info if token is valid', async () => {
        const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', profile: { identity_type: 'ID', identity_number: '1234' }, bank_account: [] };
        const mockToken = 'Bearer valid.token.here';

        jwt.verify.mockReturnValue({ user: 1 });
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const req = mockRequest({}, {}, {}, { Authorization: mockToken });
        const res = mockResponse();

        await getUserInfo(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(mockUser);
    });

    test('should return 400 if user not found', async () => {
        jwt.verify.mockReturnValue({ user: 1 });
        prisma.user.findUnique.mockResolvedValue(null);

        const req = mockRequest({}, {}, {}, { Authorization: 'Bearer valid.token.here' });
        const res = mockResponse();

        await getUserInfo(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'User not found' });
    });

    test('should return 500 if there is an error', async () => {
        jwt.verify.mockReturnValue({ user: 1 });
        prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

        const req = mockRequest({}, {}, {}, { Authorization: 'Bearer valid.token.here' });
        const res = mockResponse();

        await getUserInfo(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });

    test('should return 401 if token is invalid', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Token is not valid');
        });

        const req = mockRequest({}, {}, {}, { Authorization: 'Bearer invalid.token.here' });
        const res = mockResponse();

        await getUserInfo(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Token is not valid' });
    });
});

describe('createUser function', () => {
    test('should return 201 and create a new user', async () => {
        const mockUser = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            profile: { identity_type: 'ID', identity_number: '1234' }
        };
        bcrypt.hashSync.mockReturnValue('hashedpassword');
        prisma.user.create.mockResolvedValue(mockUser);

        const req = mockRequest({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'plaintextpassword',
            identity_type: 'ID',
            identity_number: '1234'
        });
        const res = mockResponse();

        await createUser(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith(mockUser);
    });

    test('should return 500 if there is an error', async () => {
        bcrypt.hashSync.mockReturnValue('hashedpassword');
        prisma.user.create.mockRejectedValue(new Error('Database error'));

        const req = mockRequest({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'plaintextpassword',
            identity_type: 'ID',
            identity_number: '1234'
        });
        const res = mockResponse();

        await createUser(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});