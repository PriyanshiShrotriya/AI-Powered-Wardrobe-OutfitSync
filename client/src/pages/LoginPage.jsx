import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageLayout from './AuthPageLayout';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from || '/dashboard';

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(destination, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title="Welcome back"
      subtitle="Log in to manage your wardrobe and generate outfit combinations."
      ctaText="Need an account?"
      ctaLink="/register"
      ctaLabel="Create one"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Email"
          className="ui-field"
          required
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Password"
          className="ui-field"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </AuthPageLayout>
  );
};

export default LoginPage;
