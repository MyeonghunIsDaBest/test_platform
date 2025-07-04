import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Technology' },
        update: {},
        create: {
          name: 'Technology',
          description: 'Software development, IT consulting, and tech support',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Business' },
        update: {},
        create: {
          name: 'Business',
          description: 'Business consulting, strategy, and management',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Design' },
        update: {},
        create: {
          name: 'Design',
          description: 'Graphic design, UI/UX, and creative services',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Marketing' },
        update: {},
        create: {
          name: 'Marketing',
          description: 'Digital marketing, SEO, and social media',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Legal' },
        update: {},
        create: {
          name: 'Legal',
          description: 'Legal advice, contract review, and consultation',
        },
      }),
    ]);

    logger.info(`✅ Created ${categories.length} categories`);

    // Create admin user
    const adminPassword = await hashPassword('admin123456');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@yoru-test-platform.com' },
      update: {},
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@yoru-test-platform.com',
        password: adminPassword,
        role: 'ADMIN',
        emailVerified: true,
        profile: {
          create: {
            bio: 'Platform administrator',
            verificationStatus: 'VERIFIED',
          },
        },
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
    });

    logger.info('✅ Created admin user');

    // Create sample customers
    const customerPassword = await hashPassword('customer123');
    const customers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: customerPassword,
          role: 'CUSTOMER',
          phone: '+1234567890',
          emailVerified: true,
          profile: {
            create: {
              bio: 'Tech entrepreneur looking for business advice',
              location: 'San Francisco, CA',
              timezone: 'America/Los_Angeles',
              verificationStatus: 'VERIFIED',
            },
          },
          wallet: {
            create: {
              balance: 500.00,
            },
          },
        },
      }),
      prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: customerPassword,
          role: 'CUSTOMER',
          phone: '+1234567891',
          emailVerified: true,
          profile: {
            create: {
              bio: 'Marketing manager seeking design consultation',
              location: 'New York, NY',
              timezone: 'America/New_York',
              verificationStatus: 'VERIFIED',
            },
          },
          wallet: {
            create: {
              balance: 750.00,
            },
          },
        },
      }),
    ]);

    logger.info(`✅ Created ${customers.length} customers`);

    // Create sample professionals
    const professionalPassword = await hashPassword('professional123');
    const professionals = await Promise.all([
      prisma.user.upsert({
        where: { email: 'sarah.johnson@example.com' },
        update: {},
        create: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          password: professionalPassword,
          role: 'PROFESSIONAL',
          phone: '+1234567892',
          emailVerified: true,
          profile: {
            create: {
              bio: 'Senior business consultant with 10+ years experience',
              location: 'Chicago, IL',
              timezone: 'America/Chicago',
              verificationStatus: 'VERIFIED',
            },
          },
          wallet: {
            create: {
              balance: 1200.00,
            },
          },
          professional: {
            create: {
              hourlyRate: 150.00,
              experience: 'Senior business consultant with over 10 years of experience helping startups and established companies optimize their operations and strategy.',
              skills: ['Business Strategy', 'Operations Management', 'Financial Planning', 'Team Leadership'],
              rating: 4.8,
              totalReviews: 127,
              status: 'ACTIVE',
              verifications: {
                create: {
                  identityVerified: true,
                  contactVerified: true,
                  emailVerified: true,
                  linkedinVerified: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.upsert({
        where: { email: 'mike.chen@example.com' },
        update: {},
        create: {
          firstName: 'Mike',
          lastName: 'Chen',
          email: 'mike.chen@example.com',
          password: professionalPassword,
          role: 'PROFESSIONAL',
          phone: '+1234567893',
          emailVerified: true,
          profile: {
            create: {
              bio: 'Full-stack developer and tech consultant',
              location: 'Seattle, WA',
              timezone: 'America/Los_Angeles',
              verificationStatus: 'VERIFIED',
            },
          },
          wallet: {
            create: {
              balance: 800.00,
            },
          },
          professional: {
            create: {
              hourlyRate: 120.00,
              experience: 'Full-stack developer with 8 years of experience in React, Node.js, and cloud technologies. Specialized in helping businesses build scalable web applications.',
              skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'PostgreSQL'],
              rating: 4.9,
              totalReviews: 89,
              status: 'ACTIVE',
              verifications: {
                create: {
                  identityVerified: true,
                  contactVerified: true,
                  emailVerified: true,
                  facebookVerified: true,
                  linkedinVerified: true,
                },
              },
            },
          },
        },
      }),
    ]);

    logger.info(`✅ Created ${professionals.length} professionals`);

    // Create sample listings
    const techCategory = categories.find(c => c.name === 'Technology');
    const businessCategory = categories.find(c => c.name === 'Business');

    if (techCategory && businessCategory) {
      const listings = await Promise.all([
        prisma.listing.create({
          data: {
            title: 'Web Development Consultation',
            description: 'Get expert advice on your web development projects. I can help with React, Node.js, database design, and deployment strategies.',
            categoryId: techCategory.id,
            price: 120.00,
            duration: 60,
            status: 'ACTIVE',
            professional: {
              connect: { userId: professionals[1].id },
            },
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
                {
                  dayOfWeek: 3, // Wednesday
                  startTime: '09:00',
                  endTime: '17:00',
                },
              ],
            },
          },
        }),
        prisma.listing.create({
          data: {
            title: 'Business Strategy Session',
            description: 'Strategic planning and business optimization consultation. Perfect for startups and growing businesses looking to scale efficiently.',
            categoryId: businessCategory.id,
            price: 150.00,
            duration: 90,
            status: 'ACTIVE',
            professional: {
              connect: { userId: professionals[0].id },
            },
            availability: {
              create: [
                {
                  dayOfWeek: 1, // Monday
                  startTime: '10:00',
                  endTime: '16:00',
                },
                {
                  dayOfWeek: 3, // Wednesday
                  startTime: '10:00',
                  endTime: '16:00',
                },
                {
                  dayOfWeek: 5, // Friday
                  startTime: '10:00',
                  endTime: '16:00',
                },
              ],
            },
          },
        }),
      ]);

      logger.info(`✅ Created ${listings.length} listings`);
    }

    logger.info('🎉 Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
