import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageLayout from './AuthPageLayout';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';

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
        <div>
          <label className="ui-label" htmlFor="register-email">Email</label>
          <input id="register-email" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="you@example.com" className="ui-field" required />
        </div>
        <div>
          <label className="ui-label" htmlFor="register-password">Password</label>
          <input id="register-password" type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="At least 6 characters" className="ui-field" minLength={6} required />
        </div>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? <LoadingState label="Creating account..." /> : 'Register'}
        </button>
      </form>
    </AuthPageLayout>
  );
};

export default RegisterPage;
