import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

export default function Signin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('https://medvault-sfgv.onrender.com/signin', {
        Username: username.trim(),
        Password: password,
      })
      if (res.status === 200 && res.data.token) {
        localStorage.setItem('authToken', res.data.token)
        setSuccess(true)
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } catch (err) {
      if (err?.response?.status === 400) setError('Invalid username or password.')
      else setError('Unable to sign in. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .signin-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #f0ede8;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          position: relative;
          width: 52%;
          background: #0d1f1a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 80%, #1a4a3a88 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 10%, #2d6a4f44 0%, transparent 60%);
          pointer-events: none;
        }

        .deco-circle {
          position: absolute;
          right: -120px;
          top: 50%;
          transform: translateY(-50%);
          width: 400px; height: 400px;
          border-radius: 50%;
          border: 1px solid #2d6a4f22;
          pointer-events: none;
        }

        .deco-circle-2 {
          position: absolute;
          right: -60px;
          top: 50%;
          transform: translateY(-50%);
          width: 260px; height: 260px;
          border-radius: 50%;
          border: 1px solid #52b78822;
          pointer-events: none;
        }

        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1a3a2e;
          border: 1px solid #2d6a4f55;
          border-radius: 100px;
          padding: 8px 18px;
          width: fit-content;
          margin-bottom: 48px;
        }

        .pill-dot {
          width: 8px; height: 8px;
          background: #52b788;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }

        .pill-text {
          font-size: 12px;
          color: #74c69d;
          letter-spacing: 0.08em;
          font-weight: 500;
          text-transform: uppercase;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 64px;
          font-weight: 900;
          color: #f0ede8;
          line-height: 1;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }

        .brand-name span { color: #52b788; }

        .brand-tagline {
          font-size: 16px;
          color: #8a9e96;
          line-height: 1.6;
          max-width: 340px;
          font-weight: 300;
        }

        /* stats row */
        .stats-row {
          display: flex;
          gap: 32px;
          margin-top: 56px;
        }

        .stat-item {}

        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #52b788;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #5a7a6e;
          margin-top: 4px;
          font-weight: 400;
        }

        .stat-divider {
          width: 1px;
          background: #1a3a2e;
          align-self: stretch;
        }

        /* quote */
        .quote-box {
          margin-top: 48px;
          padding: 20px 24px;
          background: #1a3a2e88;
          border: 1px solid #2d6a4f44;
          border-radius: 14px;
          backdrop-filter: blur(4px);
          max-width: 380px;
        }

        .quote-text {
          font-size: 14px;
          color: #a8c5b8;
          line-height: 1.6;
          font-style: italic;
          font-weight: 300;
        }

        .quote-author {
          font-size: 12px;
          color: #52b788;
          margin-top: 10px;
          font-weight: 600;
        }

        .left-bottom {
          font-size: 12px;
          color: #3a5a4e;
          position: relative;
          z-index: 1;
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          width: 48%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          background: #f0ede8;
        }

        .form-wrapper {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #52b788;
          margin-bottom: 12px;
        }

        .form-heading {
          font-family: 'Playfair Display', serif;
          font-size: 38px;
          font-weight: 700;
          color: #0d1f1a;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 8px;
        }

        .form-subtext {
          font-size: 14px;
          color: #7a8a84;
          margin-bottom: 36px;
          font-weight: 300;
        }

        .alert {
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: fadeUp 0.4s both;
        }
        .alert-success { background: #d8f3dc; color: #1b4332; border: 1px solid #52b78844; }
        .alert-error   { background: #ffe3e3; color: #7c1313; border: 1px solid #f0303044; }

        .field { margin-bottom: 20px; }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1a2e28;
          margin-bottom: 8px;
          letter-spacing: 0.02em;
        }

        .input-wrap { position: relative; }

        .field-input {
          width: 100%;
          padding: 14px 18px;
          background: #fff;
          border: 1.5px solid #d8d2c8;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0d1f1a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input::placeholder { color: #b0a898; }

        .field-input:focus {
          border-color: #52b788;
          box-shadow: 0 0 0 4px #52b78820;
        }

        .field-input.with-icon { padding-right: 48px; }

        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #8a9e96;
          display: flex;
          align-items: center;
          transition: color 0.15s;
          padding: 0;
        }
        .eye-btn:hover { color: #0d1f1a; }

        .submit-btn {
          width: 100%;
          padding: 15px;
          margin-top: 8px;
          background: #0d1f1a;
          color: #f0ede8;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 0.02em;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1a3a2e;
          box-shadow: 0 8px 24px #0d1f1a33;
        }

        .submit-btn:active:not(:disabled) { transform: scale(0.98); }

        .submit-btn:disabled {
          background: #2d6a4f88;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #f0ede855;
          border-top-color: #f0ede8;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }
        .divider-line { flex: 1; height: 1px; background: #d8d2c8; }
        .divider-text { font-size: 12px; color: #a09888; font-weight: 500; }

        .signup-link {
          text-align: center;
          font-size: 14px;
          color: #7a8a84;
        }

        .signup-link a {
          color: #1a3a2e;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid #52b78866;
          padding-bottom: 1px;
          transition: border-color 0.2s, color 0.2s;
        }

        .signup-link a:hover {
          color: #52b788;
          border-color: #52b788;
        }

        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; }
        }
      `}</style>

      <div className="signin-root">

        {/* ── LEFT ── */}
        <div className="left-panel">
          <div className="deco-circle" />
          <div className="deco-circle-2" />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="pill-badge">
              <div className="pill-dot" />
              <span className="pill-text">Welcome back</span>
            </div>

            <div className="brand-name">Medi<span>Track</span></div>
            <p className="brand-tagline">
              Your medicines are waiting. Pick up right where you left off.
            </p>

            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-number">99%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Missed Expiries</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Access</div>
              </div>
            </div>

            <div className="quote-box" style={{ position: 'relative', zIndex: 1 }}>
              <p className="quote-text">
                "MediTrack helped us reduce medicine waste by tracking expiries before they became a problem."
              </p>
              <p className="quote-author">— Dr. Sharma, City Clinic</p>
            </div>
          </div>

          <div className="left-bottom">
            © 2026 MediTrack · Built for healthcare professionals
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right-panel">
          <div className="form-wrapper">

            <div className="form-eyebrow">Sign in to continue</div>
            <h1 className="form-heading">Welcome<br />back</h1>
            <p className="form-subtext">Enter your credentials to access your dashboard.</p>

            {success && (
              <div className="alert alert-success">
                ✅ Login successful! Redirecting...
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label className="field-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="field-input"
                  placeholder="e.g. dr_sharma"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="input-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="field-input with-icon"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /> Signing in...</>
                ) : (
                  'Sign In →'
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <p className="signup-link">
              Don't have an account? <Link to="/signup">Create one</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  )
}
