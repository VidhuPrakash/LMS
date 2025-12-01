
import SignupForm from "@/modules/auth/sign-up-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Your App Name",
  description: "Create an account to get started with your projects",
}

export default function SignupPage() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-muted-foreground">
            Enter your information to get started
          </p>
        </div>
        
        <SignupForm />
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
