import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// WordPress database connection
const wpConnection = mysql.createConnection({
  host: process.env.WP_DB_HOST || 'localhost',
  user: process.env.WP_DB_USER || 'root',
  password: process.env.WP_DB_PASSWORD || '',
  database: process.env.WP_DB_NAME || 'wordpress',
});

interface WordPressUser {
  ID: number;
  user_login: string;
  user_email: string;
  user_nicename: string;
  display_name: string;
  user_registered: Date;
  user_status: number;
}

interface WordPressMeta {
  user_id: number;
  meta_key: string;
  meta_value: string;
}

async function migrateUsers() {
  logger.info('🔄 Starting user migration...');

  try {
    // Get WordPress users
    const [wpUsers] = await wpConnection.execute(`
      SELECT ID, user_login, user_email, user_nicename, display_name, user_registered, user_status
      FROM wp_users
      WHERE user_status = 0
    `) as [WordPressUser[], any];

    // Get user meta
    const [wpUserMeta] = await wpConnection.execute(`
      SELECT user_id, meta_key, meta_value
      FROM wp_usermeta
      WHERE meta_key IN (
        'first_name', 'last_name', 'description', 'wp_capabilities',
        'phone', 'location', 'hourly_rate', 'experience', 'skills'
      )
    `) as [WordPressMeta[], any];

    // Group meta by user ID
    const userMetaMap = new Map<number, Record<string, string>>();
    wpUserMeta.forEach(meta => {
      if (!userMetaMap.has(meta.user_id)) {
        userMetaMap.set(meta.user_id, {});
      }
      userMetaMap.get(meta.user_id)![meta.meta_key] = meta.meta_value;
    });

    let migratedCount = 0;

    for (const wpUser of wpUsers) {
      const meta = userMetaMap.get(wpUser.ID) || {};
      
      // Determine user role
      const capabilities = meta.wp_capabilities || '';
      let role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN' = 'CUSTOMER';
      
      if (capabilities.includes('administrator')) {
        role = 'ADMIN';
      } else if (capabilities.includes('professional') || meta.hourly_rate) {
        role = 'PROFESSIONAL';
      }

      // Parse name
      const firstName = meta.first_name || wpUser.display_name.split(' ')[0] || wpUser.user_nicename;
      const lastName = meta.last_name || wpUser.display_name.split(' ').slice(1).join(' ') || '';

      try {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: wpUser.user_email,
            firstName,
            lastName,
            phone: meta.phone || null,
            role,
            password: await hashPassword('temppassword123'), // Users will need to reset
            emailVerified: true,
            createdAt: wpUser.user_registered,
            profile: {
              create: {
                bio: meta.description || null,
                location: meta.location || null,
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

        // Create professional profile if applicable
        if (role === 'PROFESSIONAL' && meta.hourly_rate) {
          await prisma.professional.create({
            data: {
              userId: user.id,
              hourlyRate: parseFloat(meta.hourly_rate) || 50,
              experience: meta.experience || 'Experienced professional',
              skills: meta.skills ? JSON.parse(meta.skills) : ['Consulting'],
              status: 'ACTIVE',
              verifications: {
                create: {
                  emailVerified: true,
                  contactVerified: true,
                },
              },
            },
          });
        }

        migratedCount++;
        logger.info(`✅ Migrated user: ${wpUser.user_email}`);
      } catch (error) {
        logger.error(`❌ Failed to migrate user ${wpUser.user_email}:`, error);
      }
    }

    logger.info(`🎉 User migration completed: ${migratedCount}/${wpUsers.length} users migrated`);
  } catch (error) {
    logger.error('❌ User migration failed:', error);
    throw error;
  }
}

async function migrateCategories() {
  logger.info('🔄 Starting category migration...');

  try {
    // Get WordPress categories/terms
    const [wpTerms] = await wpConnection.execute(`
      SELECT t.term_id, t.name, t.slug, tt.description
      FROM wp_terms t
      JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
      WHERE tt.taxonomy = 'service_category'
    `) as [any[], any];

    let migratedCount = 0;

    for (const term of wpTerms) {
      try {
        await prisma.category.create({
          data: {
            name: term.name,
            description: term.description || null,
          },
        });

        migratedCount++;
        logger.info(`✅ Migrated category: ${term.name}`);
      } catch (error) {
        logger.error(`❌ Failed to migrate category ${term.name}:`, error);
      }
    }

    logger.info(`🎉 Category migration completed: ${migratedCount}/${wpTerms.length} categories migrated`);
  } catch (error) {
    logger.error('❌ Category migration failed:', error);
    throw error;
  }
}

async function migrateServices() {
  logger.info('🔄 Starting service migration...');

  try {
    // Get WordPress posts (services)
    const [wpPosts] = await wpConnection.execute(`
      SELECT p.ID, p.post_author, p.post_title, p.post_content, p.post_status, p.post_date
      FROM wp_posts p
      WHERE p.post_type = 'service' AND p.post_status = 'publish'
    `) as [any[], any];

    // Get post meta
    const [wpPostMeta] = await wpConnection.execute(`
      SELECT post_id, meta_key, meta_value
      FROM wp_postmeta
      WHERE meta_key IN ('price', 'duration', 'category_id')
    `) as [any[], any];

    // Group meta by post ID
    const postMetaMap = new Map<number, Record<string, string>>();
    wpPostMeta.forEach(meta => {
      if (!postMetaMap.has(meta.post_id)) {
        postMetaMap.set(meta.post_id, {});
      }
      postMetaMap.get(meta.post_id)![meta.meta_key] = meta.meta_value;
    });

    let migratedCount = 0;

    for (const post of wpPosts) {
      const meta = postMetaMap.get(post.ID) || {};

      try {
        // Find the professional user
        const [wpUser] = await wpConnection.execute(
          'SELECT user_email FROM wp_users WHERE ID = ?',
          [post.post_author]
        ) as [any[], any];

        if (!wpUser.length) continue;

        const user = await prisma.user.findUnique({
          where: { email: wpUser[0].user_email },
          include: { professional: true },
        });

        if (!user?.professional) continue;

        // Find category
        const category = await prisma.category.findFirst();
        if (!category) continue;

        await prisma.listing.create({
          data: {
            title: post.post_title,
            description: post.post_content,
            categoryId: category.id,
            professionalId: user.professional.id,
            price: parseFloat(meta.price) || 100,
            duration: parseInt(meta.duration) || 60,
            status: 'ACTIVE',
            createdAt: post.post_date,
          },
        });

        migratedCount++;
        logger.info(`✅ Migrated service: ${post.post_title}`);
      } catch (error) {
        logger.error(`❌ Failed to migrate service ${post.post_title}:`, error);
      }
    }

    logger.info(`🎉 Service migration completed: ${migratedCount}/${wpPosts.length} services migrated`);
  } catch (error) {
    logger.error('❌ Service migration failed:', error);
    throw error;
  }
}

async function migrateAppointments() {
  logger.info('🔄 Starting appointment migration...');

  try {
    // Get WordPress appointments (custom post type or custom table)
    const [wpAppointments] = await wpConnection.execute(`
      SELECT p.ID, p.post_title, p.post_content, p.post_date, p.post_status
      FROM wp_posts p
      WHERE p.post_type = 'appointment'
    `) as [any[], any];

    // Get appointment meta
    const [wpAppointmentMeta] = await wpConnection.execute(`
      SELECT post_id, meta_key, meta_value
      FROM wp_postmeta
      WHERE meta_key IN ('customer_id', 'professional_id', 'service_id', 'scheduled_date', 'scheduled_time', 'price')
    `) as [any[], any];

    // Group meta by appointment ID
    const appointmentMetaMap = new Map<number, Record<string, string>>();
    wpAppointmentMeta.forEach(meta => {
      if (!appointmentMetaMap.has(meta.post_id)) {
        appointmentMetaMap.set(meta.post_id, {});
      }
      appointmentMetaMap.get(meta.post_id)![meta.meta_key] = meta.meta_value;
    });

    let migratedCount = 0;

    for (const appointment of wpAppointments) {
      const meta = appointmentMetaMap.get(appointment.ID) || {};

      try {
        // Find users and listing
        const customerEmail = await getEmailFromWpUserId(parseInt(meta.customer_id));
        const professionalEmail = await getEmailFromWpUserId(parseInt(meta.professional_id));

        if (!customerEmail || !professionalEmail) continue;

        const [customer, professional] = await Promise.all([
          prisma.user.findUnique({ where: { email: customerEmail } }),
          prisma.user.findUnique({ where: { email: professionalEmail } }),
        ]);

        if (!customer || !professional) continue;

        const listing = await prisma.listing.findFirst({
          where: { professional: { userId: professional.id } },
        });

        if (!listing) continue;

        // Determine status
        let status: any = 'COMPLETED';
        if (appointment.post_status === 'pending') status = 'PENDING';
        else if (appointment.post_status === 'confirmed') status = 'CONFIRMED';
        else if (appointment.post_status === 'cancelled') status = 'CANCELLED';

        await prisma.appointment.create({
          data: {
            customerId: customer.id,
            professionalId: professional.id,
            listingId: listing.id,
            scheduledDate: new Date(meta.scheduled_date || appointment.post_date),
            scheduledTime: meta.scheduled_time || '10:00',
            status,
            notes: appointment.post_content || null,
            createdAt: appointment.post_date,
          },
        });

        migratedCount++;
        logger.info(`✅ Migrated appointment: ${appointment.ID}`);
      } catch (error) {
        logger.error(`❌ Failed to migrate appointment ${appointment.ID}:`, error);
      }
    }

    logger.info(`🎉 Appointment migration completed: ${migratedCount}/${wpAppointments.length} appointments migrated`);
  } catch (error) {
    logger.error('❌ Appointment migration failed:', error);
    throw error;
  }
}

async function getEmailFromWpUserId(userId: number): Promise<string | null> {
  try {
    const [result] = await wpConnection.execute(
      'SELECT user_email FROM wp_users WHERE ID = ?',
      [userId]
    ) as [any[], any];
    
    return result.length > 0 ? result[0].user_email : null;
  } catch {
    return null;
  }
}

async function main() {
  logger.info('🚀 Starting WordPress to Negus migration...');

  try {
    await migrateCategories();
    await migrateUsers();
    await migrateServices();
    await migrateAppointments();

    logger.info('🎉 Migration completed successfully!');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await wpConnection.end();
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as runMigration };
