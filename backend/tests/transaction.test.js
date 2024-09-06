// jest.setup.js or directly in the test file
jest.mock('../config/prisma', () => {
    return {
        transaction: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        bank_account: {
            update: jest.fn(),
        },
    };
});

const prisma = require('../config/prisma');
const { getTransaction, getTransactionById, createTransaction } = require('../controllers/transaction.controller');
const mockRequest = require('../consts/mock-request.const');
const mockResponse = require('../consts/mock-response.const');



describe('getTransaction function', () => {
    test('should return 200 with the list of transactions', async () => {
        const mockTransactions = [
            { id: 1, amount: 100, type: 'DEPOSIT', source_account_id: null, destination_account_id: 1 },
        ];
        prisma.transaction.findMany.mockResolvedValue(mockTransactions);

        const req = mockRequest();
        const res = mockResponse();

        await getTransaction(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(mockTransactions);
    });

    test('should return 500 if there is an error', async () => {
        prisma.transaction.findMany.mockRejectedValue(new Error('Database error'));

        const req = mockRequest();
        const res = mockResponse();

        await getTransaction(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});

describe('getTransactionById function', () => {
    test('should return 200 with the transaction data if found', async () => {
        const mockTransaction = { id: 1, amount: 100, type: 'DEPOSIT', source_account_id: null, destination_account_id: 1 };
        prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getTransactionById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(mockTransaction);
    });

    test('should return 404 if transaction not found', async () => {
        prisma.transaction.findUnique.mockResolvedValue(null);

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getTransactionById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({ error: 'Transaction not found' });
    });

    test('should return 500 if there is an error', async () => {
        prisma.transaction.findUnique.mockRejectedValue(new Error('Database error'));

        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        await getTransactionById(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});


describe('createTransaction function', () => {
    test('should return 201 and create a new transaction', async () => {
        const mockTransaction = {
            id: 1, amount: 100, type: 'DEPOSIT', source_account_id: null, destination_account_id: 1,
            source_account: null, destination_account: { id: 1, balance: 100 },
        };
        prisma.transaction.create.mockResolvedValue(mockTransaction);
        prisma.bank_account.update.mockResolvedValue({ id: 1, balance: 200 });

        const req = mockRequest({
            amount: 100,
            type: 'DEPOSIT',
            source_account_id: null,
            destination_account_id: 1,
        });
        const res = mockResponse();

        await createTransaction(req, res);

        expect(prisma.transaction.create).toBeCalledWith(expect.objectContaining({
            data: {
                amount: 100,
                type: 'DEPOSIT',
                source_account: undefined,
                destination_account: { connect: { id: 1 } },
            },
            include: {
                source_account: true,
                destination_account: true,
            },
        }));
        expect(prisma.bank_account.update).toBeCalledWith(expect.objectContaining({
            where: { id: 1 },
            data: { balance: { increment: 100 } },
        }));
        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({ status: 'success', data: mockTransaction });
    });
    test('should handle WITHDRAWAL and update source account balance', async () => {
        const mockTransaction = {
            id: 2, amount: 50, type: 'WITHDRAWAL', source_account_id: 1, destination_account_id: null,
            source_account: { id: 1, balance: 150 }, destination_account: null,
        };
        prisma.transaction.create.mockResolvedValue(mockTransaction);
        prisma.bank_account.update.mockResolvedValue({ id: 1, balance: 100 }); // Mocking the balance after withdrawal
    
        const req = mockRequest({
            amount: 50,
            type: 'WITHDRAWAL',
            source_account_id: 1,
            destination_account_id: null,
        });
        const res = mockResponse();
    
        await createTransaction(req, res);
    
        expect(prisma.transaction.create).toBeCalledWith(expect.objectContaining({
            data: {
                amount: 50,
                type: 'WITHDRAWAL',
                source_account: { connect: { id: 1 } },
                destination_account: undefined,
            },
            include: {
                source_account: true,
                destination_account: true,
            },
        }));
        expect(prisma.bank_account.update).toBeCalledWith(expect.objectContaining({
            where: { id: 1 },
            data: { balance: { decrement: 50 } },
        }));
        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({ status: 'success', data: mockTransaction });
    });

    test('should handle TRANSFER and update both source and destination account balances', async () => {
        const mockTransaction = {
            id: 3, amount: 200, type: 'TRANSFER', source_account_id: 1, destination_account_id: 2,
            source_account: { id: 1, balance: 500 }, destination_account: { id: 2, balance: 300 },
        };
        prisma.transaction.create.mockResolvedValue(mockTransaction);
        prisma.bank_account.update
            .mockResolvedValueOnce({ id: 1, balance: 300 }) // After decrement from source
            .mockResolvedValueOnce({ id: 2, balance: 500 }); // After increment to destination
    
        const req = mockRequest({
            amount: 200,
            type: 'TRANSFER',
            source_account_id: 1,
            destination_account_id: 2,
        });
        const res = mockResponse();
    
        await createTransaction(req, res);
    
        expect(prisma.transaction.create).toBeCalledWith(expect.objectContaining({
            data: {
                amount: 200,
                type: 'TRANSFER',
                source_account: { connect: { id: 1 } },
                destination_account: { connect: { id: 2 } },
            },
            include: {
                source_account: true,
                destination_account: true,
            },
        }));
        expect(prisma.bank_account.update).toHaveBeenNthCalledWith(1, expect.objectContaining({
            where: { id: 1 },
            data: { balance: { decrement: 200 } },
        }));
        expect(prisma.bank_account.update).toHaveBeenNthCalledWith(2, expect.objectContaining({
            where: { id: 2 },
            data: { balance: { increment: 200 } },
        }));
        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({ status: 'success', data: mockTransaction });
    });
    


    test('should return 500 if there is an error', async () => {
        prisma.transaction.create.mockRejectedValue(new Error('Database error'));

        const req = mockRequest({
            amount: 100,
            type: 'DEPOSIT',
            source_account_id: null,
            destination_account_id: 1,
        });
        const res = mockResponse();

        await createTransaction(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({ error: 'Database error' });
    });
});