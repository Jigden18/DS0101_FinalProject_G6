const prisma = {
  user: {
    findMany:   jest.fn().mockResolvedValue([]),
    findFirst:  jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create:     jest.fn().mockResolvedValue({}),
    update:     jest.fn().mockResolvedValue({}),
    delete:     jest.fn().mockResolvedValue({}),
    count:      jest.fn().mockResolvedValue(0),
  },
  listing: {
    findMany:   jest.fn().mockResolvedValue([]),
    findFirst:  jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create:     jest.fn().mockResolvedValue({}),
    update:     jest.fn().mockResolvedValue({}),
    delete:     jest.fn().mockResolvedValue({}),
    count:      jest.fn().mockResolvedValue(0),
  },
  application: {
    findMany:   jest.fn().mockResolvedValue([]),
    findFirst:  jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create:     jest.fn().mockResolvedValue({}),
    update:     jest.fn().mockResolvedValue({}),
    delete:     jest.fn().mockResolvedValue({}),
    count:      jest.fn().mockResolvedValue(0),
  },
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};

module.exports = prisma;