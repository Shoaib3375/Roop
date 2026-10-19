import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Create account · Roop Management' };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}