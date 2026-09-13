import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { UserRole } from "../../services/firebaseAuth";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectPath,
  children
}) => {
  const { session, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <div className="absolute w-6 h-6 rounded-full bg-indigo-500/20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Authenticating AegisNet Session...
        </p>
      </div>
    );
  }

  // Determine fallback login path based on target role or current pathname
  const getLoginPath = (role?: UserRole): string => {
    if (redirectPath) return redirectPath;
    if (role) return `/${role}/login`;
    if (location.pathname.startsWith("/doctor")) return "/doctor/login";
    if (location.pathname.startsWith("/guardian")) return "/guardian/login";
    if (location.pathname.startsWith("/volunteer")) return "/volunteer/login";
    if (location.pathname.startsWith("/college")) return "/college/login";
    return "/patient/login";
  };

  if (!isAuthenticated || !session) {
    const targetLogin = getLoginPath(allowedRoles?.[0]);
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // Check role authorization if restricted
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black">Unauthorized Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your current session has the role <strong className="text-indigo-400 uppercase">{session.role}</strong>, which does not have permission to view this console.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`/${session.role}/dashboard`}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              Go to Your Dashboard
            </a>
            <a
              href={getLoginPath(allowedRoles[0])}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Switch Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
