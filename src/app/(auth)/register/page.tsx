'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const testimonials = [
    {
      quote: "Untitled has saved us thousands of hours of work. We're able to spin up projects faster and take on more clients.",
      author: "Henley Shepherd",
      role: "Product Manager, Hourglass",
      company: "Web Design Agency",
    }
  ];

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/dashboard` },
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setError('This email is already registered. Please log in instead.');
          return;
        }
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: `${location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Reset any parent padding/margin that causes gaps */}
      <style>{`
        html, body { margin: 0 !important; padding: 0 !important; }
        .signup-right { display: none; }
        @media (min-width: 1024px) { .signup-right { display: flex; } }
      `}</style>

      <div style={{
        display: 'flex',
        width: '100vw',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>

        {/* ── LEFT: Form ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '2rem',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>

            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f87171, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fff' }} />
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.5rem' }}>
                Create an account
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>Start your 30-day free trial.</p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: '1rem', padding: '0.75rem',
                backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem',
              }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Social Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button onClick={handleGoogleSignup} disabled={isLoading} style={socialBtn}>
                <svg style={{ width: 20, height: 20, flexShrink: 0 }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span style={{ color: '#374151', fontWeight: 500 }}>Sign up with Google</span>
              </button>

              <button onClick={handleFacebookSignup} disabled={isLoading} style={socialBtn}>
                <svg style={{ width: 20, height: 20, flexShrink: 0 }} fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span style={{ color: '#374151', fontWeight: 500 }}>Sign up with Facebook</span>
              </button>

              <button onClick={handleAppleSignup} disabled={isLoading} style={socialBtn}>
                <svg style={{ width: 20, height: 20, flexShrink: 0 }} fill="#000" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span style={{ color: '#374151', fontWeight: 500 }}>Sign up with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', borderTop: '1px solid #d1d5db' }} />
              </div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '0.875rem' }}>
                <span style={{ padding: '0 0.5rem', backgroundColor: '#fff', color: '#6b7280' }}>OR</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                style={{
                  width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                  border: '1px solid #d1d5db', borderRadius: '0.5rem',
                  fontSize: '1rem', outline: 'none', color: '#111827',
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '0.75rem',
                  backgroundColor: isLoading ? '#fca5a5' : '#dc2626',
                  color: '#fff', border: 'none', borderRadius: '0.5rem',
                  fontSize: '1rem', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Loading...' : 'Get started'}
              </button>
            </form>

            {/* Login */}
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#dc2626', fontWeight: 500, textDecoration: 'none' }}>Log in</a>
            </p>
          </div>
        </div>

        {/* ── RIGHT: Testimonial ── */}
        <div className="signup-right" style={{
          flex: 1,
          position: 'relative',
          flexDirection: 'column',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/testimonial-image.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: '3rem', color: '#fff',
          }}>
            <div style={{ maxWidth: '32rem' }}>
              <blockquote style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
                "{testimonials[currentTestimonial].quote}"
              </blockquote>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, fontSize: '1.125rem', margin: '0 0 0.25rem' }}>
                  {testimonials[currentTestimonial].author}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#e5e7eb', margin: '0 0 0.125rem' }}>
                  {testimonials[currentTestimonial].role}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#d1d5db', margin: 0 }}>
                  {testimonials[currentTestimonial].company}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} style={{ width: 20, height: 20, fill: '#fff' }} viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setCurrentTestimonial(Math.max(0, currentTestimonial - 1))}
                  disabled={currentTestimonial === 0}
                  style={navBtn}
                >
                  <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentTestimonial(Math.min(testimonials.length - 1, currentTestimonial + 1))}
                  disabled={currentTestimonial === testimonials.length - 1}
                  style={navBtn}
                >
                  <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

const socialBtn: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const navBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  border: 'none', cursor: 'pointer', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(4px)',
};