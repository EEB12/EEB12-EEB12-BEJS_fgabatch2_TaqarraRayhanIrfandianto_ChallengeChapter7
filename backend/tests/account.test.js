// Call Function Needed to Testing
const mockRequest = require("../consts/mock-request.const");
const mockResponse = require("../consts/mock-response.const");
const {
    getAccounts,
    getAccountById,
    createAccount
} = require("../controllers/account.controller");


jest.mock('../config/prisma', () => {
    return {
        user: {
            findUnique: jest.fn(),  // Add this line
            create: jest.fn(),
        },
        bank_account: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(), // Add this line if you are also using create method in bank_account
        },
    };
});

const prisma = require('../config/prisma');


// Test Case
describe('INDEX FUNCTION TESTING IN ACCOUNT CONTROLLER', () => {
    test('should return 200 with the list of accounts', async () => {
        const mockAccounts = [{ id: 1, bank_name: "Bank A", bank_account_number: "12345678", balance: 100,userId:1 }];
        prisma.bank_account.findMany.mockResolvedValue(mockAccounts);

        const req = mockRequest();
        const res = mockResponse();

        await getAccounts(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(mockAccounts);
        
    });

    test('should return 500 if there is an error', async () => {
        prisma.bank_account.findMany.mockRejectedValue(new Error('Database error'));

        const req = mockRequest();
        const res = mockResponse();

        await getAccounts(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});


describe('GET ACCOUNT BY ID FUNCTION TESTING', () => {
    test('should return 200 with the account data if found', async () => {
        const mockAccount = { id: 1, bank_name: "Bank A", bank_account_number: "12345678", balance: 100,userId:1 };
        prisma.bank_account.findUnique.mockResolvedValue(mockAccount);

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getAccountById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(mockAccount);
    });

    test('should return 400 if account not found', async () => {
        prisma.bank_account.findUnique = jest.fn().mockResolvedValue(null); // Simulate account not found

        const req = mockRequest({}, { id: 2 });
        const res = mockResponse();

        await getAccountById(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({ error: 'Account not found' });
    });
    test('should return 500 if there is an error', async () => {
        prisma.bank_account.findUnique.mockRejectedValue(new Error('Database error'));

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getAccountById(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});

describe('CREATE ACCOUNT FUNCTION TESTING', () => {
    test('should return 201 and create a new account', async () => {
        const mockUser = { id: 1 };
        const mockAccount = {
            id: 1, bank_name: "Bank A", bank_account_number: "12345678", balance: 0, userId: 1
        };

        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.bank_account.create.mockResolvedValue(mockAccount);

        const req = mockRequest({
            bank_name: "Bank A",
            bank_account_number: "12345678",
            userId: 1
        });
        const res = mockResponse();

        await createAccount(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith(mockAccount);
    });

    test('should return 404 if user not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const req = mockRequest({
            bank_name: "Bank A",
            bank_account_number: "12345678",
            userId: 1
        });
        const res = mockResponse();

        await createAccount(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({ error: 'User not found' });
    });

    test('should return 500 if there is an error', async () => {
        prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

        const req = mockRequest({
            bank_name: "Bank A",
            bank_account_number: "12345678",
            userId: 1
        });
        const res = mockResponse();

        await createAccount(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});