import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Reset password · Roop Management' };

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" />;
}