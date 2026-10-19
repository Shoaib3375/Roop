import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Sign in · Roop Management' };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}