import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageLayout from './AuthPageLayout';

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title="Start styling"
      subtitle="Create your account and let OutfitSync recommend daily looks."
      ctaText="Already have an account?"
      ctaLink="/login"
      ctaLabel="Login"
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
          minLength={6}
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </AuthPageLayout>
  );
};

export default RegisterPage;
