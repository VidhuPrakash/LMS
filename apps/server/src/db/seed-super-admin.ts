import { db } from './index'
import { user } from './schema/auth'
import { eq } from 'drizzle-orm'
import { logger } from '../lib/logger'
import { getSeedConfig } from './seed-config'
import { auth } from '../lib/auth'

const config = getSeedConfig()

async function seedWithBetterAuth() {
  logger.info('Starting seed with Better Auth...')

  try {
    // Check if super admin already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, config.SUPER_ADMIN_EMAIL)
    })

    if (existingUser) {
      logger.info({ email: config.SUPER_ADMIN_EMAIL }, 'Super admin already exists, skipping seed')
      return
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: config.SUPER_ADMIN_NAME,
        email: config.SUPER_ADMIN_EMAIL,
        password: config.SUPER_ADMIN_PASSWORD,
        phoneNumber: config.SUPER_ADMIN_PHONE,
      },
    })

    if (!result) {
      logger.error( '❌ Failed to create super admin')
      throw new Error(result)
    }

    const userId = result.user?.id

    if (!userId) {
      throw new Error('User ID not returned from signUpEmail')
    }

    logger.info({ userId }, 'Super admin user created')

    await db
      .update(user)
      .set({ 
        role: "admin",
        emailVerified: true,
        updatedAt: new Date() 
      })
      .where(eq(user.id, userId))

    logger.info(' Super admin role and email verification updated')

  } catch (error) {
    logger.error({ error }, '❌ Seed failed')
    throw error
  }
}

export { seedWithBetterAuth }
