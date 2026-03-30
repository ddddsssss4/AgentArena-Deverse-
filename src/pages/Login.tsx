import { Link } from "react-router-dom";

export default function Login() {
  return (
    <main className="flex min-h-screen bg-surface font-body text-on-surface overflow-hidden">
      {/* Left Side: Abstract Illustration & Brand Message */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-16 overflow-hidden bg-surface-container-low">
        {/* Decorative Background Element */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 max-w-xl text-center">
          <div className="mb-12 flex justify-center">
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm ghost-border">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC47QNfWhbu07pj9gggF6ja9n1Iddwm4oBhYoZ5YRTp9nrH77hD9gbzdvY-cXO5uoWZKE4HIM9bBc8HHL7TVoRT0ognyKvi4xVZrSyRaXR06sescPPdOSm_4nJR5wIRnp4PeoVetMD_GZI2phXyZXWahLzF2qrIvuNgpDJiWEu7TzQuja7PhOaS0JsNGdc_Ush0aT404TwggZ_xMUb7epnr7ehJKuQ5vlZrF89N_YxJuVHGfmGCKOs6hL1k4028LQogXWvNcAgj9FhB"
                alt="Abstract 3D digital workspace"
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
          {/* Status Indicator (Role-Based Chips) */}
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
          {/* Mobile Logo/Header */}
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

          {/* Social Authentication Cluster */}
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/lobby"
              className="flex items-center justify-center gap-3 w-full px-6 py-3.5 bg-surface ghost-border rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span>Continue with Google</span>
            </Link>
            <Link
              to="/lobby"
              className="flex items-center justify-center gap-3 w-full px-6 py-3.5 bg-on-background text-white rounded-lg font-semibold hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              <span>Continue with GitHub</span>
            </Link>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface-container-lowest text-on-surface-variant font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2" htmlFor="email">
                Email address
              </label>
              <input
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg ghost-border focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface"
                id="email"
                name="email"
                placeholder="dev@arena.ai"
                type="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <a className="text-sm font-medium text-primary hover:underline" href="#">
                  Forgot?
                </a>
              </div>
              <input
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg ghost-border focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
              />
            </div>
            <Link
              to="/lobby"
              className="soul-gradient w-full py-4 rounded-lg text-white font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.99] transition-all flex justify-center"
            >
              Sign In
            </Link>
          </form>

          <div className="text-center pt-4">
            <p className="text-on-surface-variant">
              New to the arena?
              <a className="text-primary font-bold hover:underline ml-1" href="#">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Contextual Decorative Elements (Floating Labels) */}
      <div className="fixed top-8 right-8 pointer-events-none hidden lg:block">
        <div className="glass-card ghost-border rounded-xl px-4 py-3 flex items-center gap-3 animate-bounce shadow-xl shadow-indigo-500/5">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              AI Insight
            </span>
            <span className="text-xs font-semibold text-on-surface">
              3 new pipeline optimizations ready
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
