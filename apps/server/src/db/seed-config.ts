import { z } from 'zod'

const seedConfigSchema = z.object({
  SUPER_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default('SuperAdmin@123'),
  SUPER_ADMIN_NAME: z.string().default('Super Admin'),
  SUPER_ADMIN_PHONE: z.string().optional(),
})

export function getSeedConfig() {
  const config = {
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME,
    SUPER_ADMIN_PHONE: process.env.SUPER_ADMIN_PHONE,
  }

  const result = seedConfigSchema.safeParse(config)

  if (!result.success) {
    throw new Error(`Invalid seed config: ${result.error.message}`)
  }

  return result.data
}