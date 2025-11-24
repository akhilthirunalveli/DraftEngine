import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "../firebase";

const Login = () => {
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register } = useAuth();
  const n = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const h = async (ev) => {
    ev.preventDefault();
    try {
      await login(e, p);
      n(redirect);
    } catch (x) {
      setErr("Invalid email or password");
    }
  };

  const handleGoogleSignIn = async () => {
    setErr("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const email = result.user?.email;
      if (!email) {
        throw new Error("Google account missing email");
      }

      const syntheticPassword = `firebase:${result.user.uid}`;

      try {
        await register(email, syntheticPassword);
      } catch (regErr) {
        if (regErr?.response?.status !== 400) {
          throw regErr;
        }
      }

      await login(email, syntheticPassword);
      n(redirect);
    } catch (x) {
      console.error(x);
      setErr("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-5">
      <div className="login-container w-full max-w-[400px] border border-black p-10 bg-white shadow-[8px_8px_0px_#000000] relative rounded-xl" style={{ fontFamily: "'Stack Sans Notch', sans-serif" }}>
        {/* Pseudo-element border effect */}
        <div className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 border border-black rounded-xl -z-10"></div>
        
        <h1 className="text-black mb-2 text-[28px] font-bold text-center">LOGIN</h1>
        
        {err && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm border-2 border-black">
            {err}
          </div>
        )}

        <form onSubmit={h}>
          <div className="input-group mb-5 relative">
            <label htmlFor="email" className="block mb-2 font-bold text-black">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="your@email.com"
              value={e}
              onChange={(ev) => setE(ev.target.value)}
              className="w-full py-3 px-4 border-2 border-black bg-white text-base outline-none transition-all focus:shadow-[4px_4px_0px_#000000]"
            />
          </div>
          
          <div className="input-group mb-5 relative">
            <label htmlFor="password" className="block mb-2 font-bold text-black">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              placeholder="••••••••"
              value={p}
              onChange={(ev) => setP(ev.target.value)}
              className="w-full py-3 px-4 border-2 border-black bg-white text-base outline-none transition-all focus:shadow-[4px_4px_0px_#000000]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#fbeee0] text-black border-2 border-black text-base rounded-lg font-bold cursor-pointer mt-2.5 transition-all shadow-[4px_4px_0px_#000000] translate-x-0.5 translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000000]"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full mt-4 py-3 bg-white text-black border-2 border-black text-base font-bold cursor-pointer transition-all shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-3 rounded-lg active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000000] disabled:opacity-60"
          >
            {googleLoading ? "Connecting..." : "Sign in with Google"}
          </button>
        </form>

        <div className="footer text-center mt-5 text-black">
          Don't have an account?{" "}
          <Link to="/register" className="text-black font-bold underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;