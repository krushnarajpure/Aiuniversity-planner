import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f7] px-4 py-10">
      <div className="mx-auto max-w-[520px] rounded-[26px] border border-[#dfe5ef] bg-[#f7f8fa] p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <RegisterForm />
      </div>
    </main>
  );
}
