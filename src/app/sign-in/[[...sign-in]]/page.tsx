import { SignIn, SignOutButton } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sanitizeRedirectUrl } from "@/auth/redirect-helper";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ error?: string; redirect_url?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");
  const params = await searchParams;

  // Sanitize the redirect URL to prevent Open Redirect vulnerabilities
  const redirectUrl = sanitizeRedirectUrl(params.redirect_url);

  if (isMockEnabled) {
    const handleMockLogin = async (formData: FormData) => {
      "use server";
      const userId = formData.get("userId") as string;
      if (userId) {
        const cookieStore = await cookies();
        const isSecure = process.env.NODE_ENV === "production" && process.env.PLAYWRIGHT_TEST_ENV !== "true";
        cookieStore.set("x-mock-user-id", userId, {
          httpOnly: true,
          secure: isSecure,
          sameSite: "lax",
          path: "/",
        });
        cookieStore.set("x-mock-session-id", "mock-session-" + Date.now(), {
          httpOnly: true,
          secure: isSecure,
          sameSite: "lax",
          path: "/",
        });
      }
      redirect(redirectUrl);
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="w-full max-w-md space-y-8 bg-dark-muted/5 p-8 rounded-2xl border border-white/10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Mock Login Console</h2>
            <p className="mt-2 text-sm text-slate-400">Sólo disponible en entorno de pruebas E2E</p>
          </div>

          {params.error === "inactive" && (
            <div
              className="bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg text-center"
              id="lockout-message"
            >
              Tu cuenta está inactiva. Contacta al administrador.
            </div>
          )}

          {params.error === "denied" && (
            <div
              className="bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg text-center"
              id="lockout-message"
            >
              Acceso denegado. No tienes permisos para acceder a esta área.
            </div>
          )}

          <form action={handleMockLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <button
                type="submit"
                name="userId"
                value="mock_admin_user"
                id="btn-login-admin"
                className="w-full py-3 px-4 rounded-lg bg-secondary text-white font-bold hover:bg-secondary/80 transition-all cursor-pointer text-center"
              >
                Ingresar como Administrador
              </button>
              <button
                type="submit"
                name="userId"
                value="mock_viewer_user"
                id="btn-login-viewer"
                className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-all cursor-pointer text-center"
              >
                Ingresar como Lector (Viewer)
              </button>
              <button
                type="submit"
                name="userId"
                value="mock_inactive_user"
                id="btn-login-inactive"
                className="w-full py-3 px-4 rounded-lg bg-red-600/20 text-red-200 font-bold hover:bg-red-600/30 border border-red-600/40 transition-all cursor-pointer text-center"
              >
                Ingresar como Usuario Inactivo
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Handle inactive/denied error states in live Clerk mode to prevent infinite redirect loops
  if (params.error === "inactive" || params.error === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="w-full max-w-md space-y-8 bg-dark-muted/5 p-8 rounded-2xl border border-white/10 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight" id="lockout-heading">
            {params.error === "inactive" ? "Cuenta Inactiva" : "Acceso Denegado"}
          </h2>
          <p className="text-sm text-slate-400" id="lockout-description">
            {params.error === "inactive"
              ? "Tu cuenta está inactiva. Por favor, contacta al administrador del sistema."
              : "No tienes los permisos necesarios para acceder a esta área."}
          </p>
          <div className="pt-4">
            <SignOutButton redirectUrl="/sign-in">
              <button className="w-full py-3 px-4 rounded-lg bg-secondary text-white font-bold hover:bg-secondary/80 transition-all cursor-pointer text-center" id="btn-lockout-signout">
                Cerrar Sesión
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    );
  }

  // Render Clerk SignIn with the official redirect parameters supported by the installed Clerk version
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <SignIn forceRedirectUrl={redirectUrl} signUpForceRedirectUrl={redirectUrl} />
    </div>
  );
}
