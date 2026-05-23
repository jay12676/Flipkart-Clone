import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { push } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const redirectTo = location.state?.from?.pathname || '/';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Enter your email and password');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      push('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto my-6 grid max-w-4xl gap-0 shadow-card md:grid-cols-[40%_60%]">
      <aside className="hidden flex-col gap-4 bg-flipBlue p-10 text-white md:flex">
        <h2 className="text-2xl font-medium">Login</h2>
        <p className="text-base text-white/85">
          Get access to your Orders, Wishlist and Recommendations.
        </p>
      </aside>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 bg-white p-8 md:p-10">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-flipMuted">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-10 rounded border border-flipBorder bg-white px-3 text-sm outline-none focus:border-flipBlue"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-flipMuted">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-10 rounded border border-flipBorder bg-white px-3 text-sm outline-none focus:border-flipBlue"
          />
        </label>

        {error && <p className="text-xs font-semibold text-flipOrange">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-flipOrange py-3 text-sm font-semibold uppercase tracking-wide text-white shadow disabled:opacity-50"
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>

        <p className="mt-2 text-center text-sm">
          New to Flipkart?{' '}
          <Link
            to="/signup"
            state={location.state}
            className="font-semibold text-flipBlue hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password'))
    return 'Wrong email or password';
  if (code.includes('user-not-found')) return 'No account with that email';
  if (code.includes('email-already-in-use'))
    return 'An account already exists with that email';
  if (code.includes('weak-password'))
    return 'Password must be at least 6 characters';
  if (code.includes('invalid-email')) return 'Enter a valid email';
  if (code.includes('too-many-requests'))
    return 'Too many attempts — try again in a minute';
  return err?.message || 'Something went wrong';
}
