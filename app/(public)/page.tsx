import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-svh flex-col justify-end px-6 pb-12 pt-8 outline-none sm:justify-center sm:pb-16"
    >
      <div className="landing-reveal mb-10 flex items-start gap-4">
        <BrandMark className="mt-1 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
            Hábitos, sem julgamento
          </p>
          <h1 className="text-display-xl mt-2 text-foreground">
            Diet
            <br />
            Tracker
          </h1>
        </div>
      </div>

      <div className="landing-reveal landing-reveal-delay-1 max-w-[22rem] text-left">
        <p className="text-pretty text-base leading-relaxed text-muted-foreground">
          Registre escapadas e exercícios, veja o ritmo dia a dia e mantenha
          consistência com leveza.
        </p>
      </div>

      <div className="landing-reveal landing-reveal-delay-2 mt-10">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/home" });
          }}
        >
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full max-w-[22rem] gap-3 px-6 text-base shadow-md shadow-primary/15"
          >
            <GoogleIcon />
            Entrar com Google
          </Button>
        </form>
      </div>
    </main>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="44"
      height="52"
      viewBox="0 0 44 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22 4c-8 10-14 22-14 34 0 6 6 10 14 10s14-4 14-10c0-12-6-24-14-34z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 14v18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 26h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden
      className="size-5 shrink-0"
    >
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
