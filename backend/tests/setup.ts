import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Setup test database
export async function setupTestDatabase() {
  // Reset database
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS test CASCADE`;
  await prisma.$executeRaw`CREATE SCHEMA test`;
  
  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  });
  
  // Seed test data
  await seedTestData();
}

// Clean up test database
export async function cleanupTestDatabase() {
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS test CASCADE`;
  await prisma.$disconnect();
}

// Seed test data
async function seedTestData() {
  // Create test categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        description: 'Software development and IT services',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Business',
        description: 'Business consulting and strategy',
      },
    }),
  ]);

  // Create test users
  const testUsers = await Promise.all([
    // Admin user
    prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.HL9S.', // password123
        role: 'ADMIN',
        emailVerified: true,
        profile: {
          create: {
            verificationStatus: 'VERIFIED',
          },
        },
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
    }),
    
    // Customer user
    prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Customer',
        email: 'customer@test.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.HL9S.', // password123
        role: 'CUSTOMER',
        emailVerified: true,
        profile: {
          create: {
            bio: 'Test customer',
            verificationStatus: 'VERIFIED',
          },
        },
        wallet: {
          create: {
            balance: 1000,
          },
        },
      },
    }),
    
    // Professional user
    prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'Professional',
        email: 'professional@test.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.HL9S.', // password123
        role: 'PROFESSIONAL',
        emailVerified: true,
        profile: {
          create: {
            bio: 'Test professional',
            verificationStatus: 'VERIFIED',
          },
        },
        wallet: {
          create: {
            balance: 500,
          },
        },
        professional: {
          create: {
            hourlyRate: 100,
            experience: 'Test professional with 5 years experience',
            skills: ['React', 'Node.js', 'TypeScript'],
            status: 'ACTIVE',
            verifications: {
              create: {
                emailVerified: true,
                contactVerified: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Create test listing
  const professional = testUsers[2]; // Professional user
  const professionalProfile = await prisma.professional.findUnique({
    where: { userId: professional.id },
  });

  const listing = await prisma.listing.create({
    data: {
      title: 'React Development Consultation',
      description: 'Get expert advice on React development',
      categoryId: categories[0].id,
      professionalId: professionalProfile!.id,
      price: 100,
      duration: 60,
      status: 'ACTIVE',
      availability: {
        create: [
          {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00',
          },
          {
            dayOfWeek: 2, // Tuesday
            startTime: '09:00',
            endTime: '17:00',
          },
        ],
      },
    },
  });

  // Create test appointment
  const customer = testUsers[1]; // Customer user
  await prisma.appointment.create({
    data: {
      customerId: customer.id,
      professionalId: professional.id,
      listingId: listing.id,
      scheduledDate: new Date('2024-12-01'),
      scheduledTime: '10:00',
      status: 'CONFIRMED',
      notes: 'Test appointment',
    },
  });

  return {
    categories,
    users: testUsers,
    listing,
  };
}

// Test utilities
export const testUtils = {
  // Generate JWT token for testing
  generateTestToken: (userId: string, role: string = 'CUSTOMER') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, email: 'test@test.com', role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },

  // Create test user
  createTestUser: async (overrides: any = {}) => {
    return prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@test.com`,
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.HL9S.',
        role: 'CUSTOMER',
        emailVerified: true,
        profile: {
          create: {
            verificationStatus: 'VERIFIED',
          },
        },
        wallet: {
          create: {
            balance: 100,
          },
        },
        ...overrides,
      },
    });
  },

  // Create test professional
  createTestProfessional: async (overrides: any = {}) => {
    const user = await testUtils.createTestUser({
      role: 'PROFESSIONAL',
      professional: {
        create: {
          hourlyRate: 50,
          experience: 'Test professional',
          skills: ['Testing'],
          status: 'ACTIVE',
          verifications: {
            create: {
              emailVerified: true,
            },
          },
        },
      },
      ...overrides,
    });
    return user;
  },

  // Create test listing
  createTestListing: async (professionalId: string, overrides: any = {}) => {
    const category = await prisma.category.findFirst();
    const professional = await prisma.professional.findUnique({
      where: { userId: professionalId },
    });

    return prisma.listing.create({
      data: {
        title: 'Test Service',
        description: 'Test service description',
        categoryId: category!.id,
        professionalId: professional!.id,
        price: 50,
        duration: 30,
        status: 'ACTIVE',
        ...overrides,
      },
    });
  },

  // Create test appointment
  createTestAppointment: async (
    customerId: string,
    professionalId: string,
    listingId: string,
    overrides: any = {}
  ) => {
    return prisma.appointment.create({
      data: {
        customerId,
        professionalId,
        listingId,
        scheduledDate: new Date('2024-12-01'),
        scheduledTime: '10:00',
        status: 'PENDING',
        ...overrides,
      },
    });
  },

  // Clean up test data
  cleanup: async () => {
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.review.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.appointmentExtension.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.listingAvailability.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.professionalVerifications.deleteMany();
    await prisma.professional.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
  },
};

// Jest setup
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

beforeEach(async () => {
  await testUtils.cleanup();
  await seedTestData();
});

export { prisma as testPrisma };
