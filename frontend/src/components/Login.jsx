import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email.trim(), password);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  const loginStyles = `
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      font-family: inherit;
      background: linear-gradient(135deg, #e8eef4 0%, #f0f4f8 50%, #e5eef7 100%);
      background-attachment: fixed;
      position: relative;
      overflow-y: auto;
    }

    .login-page::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 20% 30%, rgba(0, 133, 255, 0.06) 0%, transparent 40%),
                  radial-gradient(circle at 80% 70%, rgba(0, 200, 117, 0.05) 0%, transparent 40%);
      pointer-events: none;
      z-index: 0;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(225, 225, 225, 0.8);
      border-radius: 20px;
      padding: 44px 40px;
      width: 100%;
      max-width: 420px;
      margin: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 133, 255, 0.06);
      position: relative;
      z-index: 1;
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }

    @media (max-width: 480px) {
      .login-page {
        padding: 20px 16px;
        align-items: flex-start;
      }
      .login-card {
        padding: 32px 24px;
        border-radius: 16px;
      }
      .login-header h1 {
        font-size: 22px;
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .login-header .login-icon-wrap {
      width: 56px;
      height: 56px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #0085ff 0%, #00a3ff 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 8px 24px rgba(0, 133, 255, 0.35);
    }

    .login-header h1 {
      font-size: 26px;
      font-weight: 700;
      color: #323338;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    .login-header p {
      font-size: 14px;
      color: #676879;
      margin: 0;
      font-weight: 500;
    }

    .login-form label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #323338;
      margin-bottom: 8px;
    }

    .login-form .field-wrap {
      margin-bottom: 22px;
    }

    .login-form input {
      width: 100%;
      padding: 14px 14px 14px 44px;
      border: 1px solid #e1e1e1;
      border-radius: 12px;
      font-size: 14px;
      color: #323338;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      background: #fafbfc;
    }

    .login-form input:focus {
      outline: none;
      border-color: #0085ff;
      box-shadow: 0 0 0 3px rgba(0, 133, 255, 0.18);
      background: #fff;
    }

    .login-form .input-wrap {
      position: relative;
    }

    .login-form .input-wrap svg {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #9fa2b2;
    }

    .login-error {
      font-size: 13px;
      color: #c73e54;
      margin-bottom: 16px;
      padding: 12px 14px;
      background: #fff5f6;
      border-radius: 12px;
      border: 1px solid #ffd4d4;
    }

    .login-submit {
      width: 100%;
      padding: 14px 16px;
      background: linear-gradient(135deg, #0085ff 0%, #006edb 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(0, 133, 255, 0.4);
      transition: all 0.2s;
    }

    .login-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-hint {
      margin-top: 24px;
      padding: 18px 16px;
      background: #f8f9fb;
      border-radius: 12px;
      border: 1px solid #e8eaed;
      font-size: 12px;
      color: #676879;
    }

    code {
      background: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      color: #0085ff;
      border: 1px solid #e5f4ff;
    }
  `;

  return (
    <div className="login-page">
      <style>{loginStyles}</style>
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrap">
            <LogIn size={28} strokeWidth={2.5} />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your Work OS account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-wrap">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field-wrap">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrap">
              <Lock size={18} />
              <input
                id="login-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : <><LogIn size={18} strokeWidth={2.5} /> Sign in</>}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
