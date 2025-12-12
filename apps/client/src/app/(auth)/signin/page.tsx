import SigninForm from "@/modules/auth/sign-in-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - Your App Name",
  description: "Sign in to access your account and manage your projects",
}

export default function SigninPage() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        
        <SigninForm />
        
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
