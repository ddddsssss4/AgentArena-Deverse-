import { useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const { user, isLoading, handleGoogleCredential } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/lobby", { replace: true });
  }, [user, navigate]);

  const handleGoogleSuccess = async (tokenResponse: { access_token?: string; credential?: string }) => {
    try {
      setError(null);
      // @react-oauth/google returns access_token (implicit flow) or credential (popup)
      // For the implicit/token flow, we need to fetch user info
      if (tokenResponse.access_token) {
        // Fetch Google userinfo with access token, then send to our backend
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json() as { sub: string; email: string; name: string; picture?: string };

        // Sign our own credential-like object — worker validates sub/email directly
        const res = await fetch("/api/auth/google/userinfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userInfo),
        });
        if (!res.ok) throw new Error("Login failed");
        const { token, user: authedUser } = await res.json() as { token: string; user: typeof userInfo & { color: string; id: string } };
        useAuthStore.getState().setAuth({ ...authedUser, avatarUrl: authedUser.picture }, token);
        navigate("/lobby");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess as Parameters<typeof useGoogleLogin>[0]["onSuccess"],
    onError: () => setError("Google login was cancelled or failed."),
  });

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Replaced TopNavBar with a minimal Branding Anchor for navigation back or identity */}
      <header className="w-full px-8 py-6 flex justify-between items-center bg-transparent z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl font-headline font-bold text-primary tracking-tighter">Technical Atelier</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="font-label text-xs uppercase tracking-widest text-secondary hover:text-primary transition-colors">Documentation</a>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 relative overflow-hidden pb-12">
        {/* Abstract Atmospheric Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary-fixed/20 to-secondary-fixed/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Column: Editorial Intro */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="font-headline text-5xl md:text-6xl font-bold text-on-surface leading-[1.1] tracking-tight">
                Deverse OS
              </h1>
              <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-lg">
                Deverse OS is an open-source, edge-native multiplayer playground where developers collaborate with AI engineers in 3D.
              </p>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-primary">Edge-Native Core</h3>
                  <p className="text-sm text-outline">Ultra-low latency infrastructure for real-time synthesis.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>deployed_code</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-primary">Spatial Collaboration</h3>
                  <p className="text-sm text-outline">Code and visualize complex AI architectures in 3D space.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="flex flex-col items-center lg:items-end">
            {/* Status Badge */}
            <div className="mb-6 flex items-center gap-3 px-4 py-2 bg-surface-container-lowest rounded-full shadow-sm border border-outline-variant/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary shadow-[0_0_8px_rgba(78,97,105,0.6)]"></span>
              </span>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-secondary">Edge Infrastructure: Active</span>
            </div>

            <div className="w-full max-w-md bg-surface-container-lowest p-10 md:p-12 rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden">
              {/* Visual Texture */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="text-center lg:text-left">
                  <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Initialize Session</h2>
                  <p className="font-body text-on-surface-variant">Enter the atelier workspace.</p>
                </div>
                
                {error && (
                  <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-mono border border-error/20">
                    [ERROR] {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Google Button */}
                  <button 
                    onClick={() => login()}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-surface-container-low text-on-surface font-headline font-bold border border-outline-variant/20 hover:bg-surface-container-high transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                    )}
                    <span>{isLoading ? "Authenticating..." : "Continue with Google"}</span>
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-outline-variant/20"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-outline">
                      <span className="bg-surface-container-lowest px-4">Standard Protocol</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary px-1">Access Identity</label>
                      <input 
                        type="email" 
                        placeholder="dev@deverse.os" 
                        disabled
                        className="w-full px-6 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-1 focus:ring-primary/40 placeholder:text-outline-variant/50 font-body transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary px-1">Credential Hash</label>
                      <input 
                        type="password" 
                        placeholder="••••••••••••" 
                        disabled
                        className="w-full px-6 py-4 bg-surface-container-high/50 rounded-xl border-none focus:ring-1 focus:ring-primary/40 placeholder:text-outline-variant/50 font-body transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed" 
                      />
                    </div>
                    
                    <button 
                      disabled
                      className="w-full py-4 rounded-full bg-surface-container-highest text-secondary font-headline font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner border border-outline-variant/10"
                    >
                      Authentication Disabled
                    </button>
                  </div>
                </div>

                <p className="text-center text-sm text-on-surface-variant">
                  New to the infrastructure? <a href="#" className="text-primary font-bold hover:underline">Request Access</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center w-full px-8 py-6 mt-auto bg-surface-container-lowest border-t border-outline-variant/10 relative z-20">
        <div className="flex items-center gap-4">
          <span className="font-label text-[10px] uppercase tracking-widest text-outline">© 2024 Technical Atelier. Edge-Native Playground.</span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <a href="#" className="font-label text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="font-label text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors">Terms</a>
          <a href="#" className="font-label text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors">Github</a>
        </div>
      </footer>
    </div>
  );
}
