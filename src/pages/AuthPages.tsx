
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, authApi } from '../api/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await authApi.login(email, password);
      if (data.success) {
        login(data.token, data.userId, data.email, data.fullName, data.roles);
        const roles = data.roles as string[];
        if (roles.includes('Admin') || roles.includes('Staff')) navigate('/parts');
        else navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Vehicle Parts System</h1>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    role: 'Customer' as 'Customer' | 'Staff' | 'Admin',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { data } = await api.post('/auth/register', {
        Name: form.name,
        Email: form.email,
        Password: form.password,
        ConfirmPassword: form.confirmPassword,
        Phone: form.phone,
        Address: form.address,
        Role: form.role
      });
      if (data.success) {
        navigate('/login');
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      let errorMsg = err.response?.data?.message || 'Registration failed';
      if (errors) {
        errorMsg = Object.values(errors).flat().join(' ');
      }
      setError(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Vehicle Parts System</h1>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
          <input type="text" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input type="text" placeholder="Address (optional)" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'Customer' | 'Staff' | 'Admin' }))} required>
            <option value="Customer">Customer</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit">Register</button>
        </form>
        {error && <div className="error">{error}</div>}
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}
