import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-1 font-serif text-3xl font-medium">Set a new password</h1>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
