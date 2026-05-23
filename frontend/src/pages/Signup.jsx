import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { friendlyAuthError } from './Login.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const { push } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await signup(email.trim(), password);
      push('Account created — welcome!');
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
        <h2 className="text-2xl font-medium">Looks like you're new here!</h2>
        <p className="text-base text-white/85">
          Sign up with your email to continue.
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
            Password (min 6 chars)
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="h-10 rounded border border-flipBorder bg-white px-3 text-sm outline-none focus:border-flipBlue"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-flipMuted">
            Confirm Password
          </span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="h-10 rounded border border-flipBorder bg-white px-3 text-sm outline-none focus:border-flipBlue"
          />
        </label>

        {error && <p className="text-xs font-semibold text-flipOrange">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-flipOrange py-3 text-sm font-semibold uppercase tracking-wide text-white shadow disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Sign Up'}
        </button>

        <p className="mt-2 text-center text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-semibold text-flipBlue hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
