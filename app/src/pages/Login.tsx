import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/admin");
    },
    onError: (e) => setError(e.message),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <img src="/brand/logo.png" alt="" className="mx-auto h-16 w-auto" />
          <h1 className="mt-5 font-display text-4xl text-ink">
            Shré<span className="text-rose">~</span>Div
          </h1>
          <p className="eyebrow mt-2">Shop Console</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            login.mutate({ username: username.trim(), password });
          }}
          className="border border-ink/10 bg-cream p-7"
        >
          <label
            htmlFor="username"
            className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint"
          >
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            className="w-full border border-ink/15 bg-ivory px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
          />

          <label
            htmlFor="password"
            className="mb-1.5 mt-5 block text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-ink/15 bg-ivory px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
          />

          {error && (
            <p
              role="alert"
              className="mt-4 border-l-2 border-rose bg-rose-pale px-3 py-2 text-sm text-rose-deep"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="btn-sharp mt-7 w-full disabled:opacity-50"
          >
            {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-faint">
          <a href="/" className="link-sweep">
            Back to the store
          </a>
        </p>
      </div>
    </div>
  );
}
