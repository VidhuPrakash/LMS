import { auth } from './../../../server/src/lib/auth';
import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL as string,
  plugins: [adminClient(),inferAdditionalFields<typeof auth>()],
})