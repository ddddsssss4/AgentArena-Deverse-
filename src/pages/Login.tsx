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
    <main className="flex min-h-screen bg-surface font-body text-on-surface overflow-hidden">
      {/* Left Side: Brand / Illustration */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-16 overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-xl text-center">
          <div className="mb-12 flex justify-center">
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm ghost-border">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC47QNfWhbu07pj9gggF6ja9n1Iddwm4oBhYoZ5YRTp9nrH77hD9gbzdvY-cXO5uoWZKE4HIM9bBc8HHL7TVoRT0ognyKvi4xVZrSyRaXR06sescPPdOSm_4nJR5wIRnp4PeoVetMD_GZI2phXyZXWahLzF2qrIvuNgpDJiWEu7TzQuja7PhOaS0JsNGdc_Ush0aT404TwggZ_xMUb7epnr7ehJKuQ5vlZrF89N_YxJuVHGfmGCKOs6hL1k4028LQogXWvNcAgj9FhB"
                alt="3D workspace"
                className="w-full h-auto rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
            Welcome to the AI Developer Arena
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed font-medium">
            Collaborate with your specialized AI squad in a spatial 3D world.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary-fixed text-primary ring-1 ring-primary/10">
              Frontend Agents
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-surface-variant text-secondary ring-1 ring-secondary/10">
              Backend Pipelines
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-tertiary-fixed text-on-tertiary-fixed-variant ring-1 ring-tertiary/10">
              DevOps Orchestrator
            </span>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-container-lowest">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-10">
            <h2 className="font-headline text-3xl font-extrabold text-primary">
              AI Developer Arena
            </h2>
          </div>

          <div className="text-left">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Sign in to your arena
            </h2>
            <p className="mt-3 text-on-surface-variant">
              Continue your journey with your AI specialized squad.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={() => login()}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 w-full px-6 py-3.5 bg-surface ghost-border rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>{isLoading ? "Signing in…" : "Continue with Google"}</span>
          </button>

          <p className="text-xs text-on-surface-variant text-center pt-2">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>

      {/* Decorative floating badge */}
      <div className="fixed top-8 right-8 pointer-events-none hidden lg:block">
        <div className="glass-card ghost-border rounded-xl px-4 py-3 flex items-center gap-3 animate-bounce shadow-xl shadow-indigo-500/5">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Insight</span>
            <span className="text-xs font-semibold text-on-surface">3 NPCs online and ready</span>
          </div>
        </div>
      </div>
    </main>
  );
}
