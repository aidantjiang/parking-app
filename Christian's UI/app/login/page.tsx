import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>

        <form className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Button type="submit" variant="primary" fullWidth>
            Sign in
          </Button>
        </form>

        <Button variant="ghost" fullWidth>
          Continue as guest
        </Button>
      </div>
    </main>
  );
}
