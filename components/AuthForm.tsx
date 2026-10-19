'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' | 'forgot' | 'reset' }) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (!supabase) {
      setMessage('Account access is not configured yet. Add the Supabase environment variables and database schema first.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/join`,
          },
        });
        if (error) throw error;
        setMessage('Check your inbox for a confirmation link. After confirming, sign in to complete your model application.');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const next = new URLSearchParams(window.location.search).get('next');
        router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/mine');
        router.refresh();
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setMessage('If an account exists for that address, a password reset link is on its way.');
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Password updated. You can now continue to your profile.');
        router.replace('/mine');
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'signup' ? 'Create your account' : mode === 'login' ? 'Welcome back' : mode === 'forgot' ? 'Reset your password' : 'Choose a new password';
  const action = mode === 'signup' ? 'Create account' : mode === 'login' ? 'Sign in' : mode === 'forgot' ? 'Send reset link' : 'Update password';

  return (
    <section className="wrap page auth-page">
      <p className="mono muted">Roop account</p>
      <h1 className="page__title">{title}</h1>
      <form className="form auth-form" onSubmit={submit}>
        {mode === 'signup' && <div className="fld"><label htmlFor="auth-name">Full name</label><input id="auth-name" className="in" autoComplete="name" required maxLength={160} value={name} onChange={(e) => setName(e.target.value)} /></div>}
        {mode !== 'reset' && <div className="fld"><label htmlFor="auth-email">Email address</label><input id="auth-email" className="in" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></div>}
        {(mode === 'signup' || mode === 'login' || mode === 'reset') && <div className="fld"><label htmlFor="auth-password">{mode === 'reset' ? 'New password' : 'Password'}</label><input id="auth-password" className="in" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} /><p className="hint">Use at least 10 characters.</p></div>}
        <button className="btn btn--solid" type="submit" disabled={busy}>{busy ? 'Please wait…' : action}</button>
        {message && <p className="note" role="status">{message}</p>}
        {mode === 'login' && <p className="hint"><Link className="link" href="/forgot-password">Forgot password?</Link></p>}
        {mode === 'login' && <p className="hint">New to Roop? <Link className="link" href="/signup">Create an account</Link></p>}
        {mode === 'signup' && <p className="hint">Already registered? <Link className="link" href="/login">Sign in</Link></p>}
      </form>
    </section>
  );
}