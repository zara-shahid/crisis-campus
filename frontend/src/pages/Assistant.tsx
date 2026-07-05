import AIChat from "../components/AIChat";
import { useAuth } from "../context/AuthContext";

export default function Assistant() {
  const { user } = useAuth();
  const conditions = user?.medical_conditions ?? [];

  return (
    <main className="min-h-screen bg-canvas px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-action">
          AI Emergency Assistant
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-base">
          Tell us what's happening
        </h1>
        <p className="mt-2 text-base/60">
          We'll turn it into a clear, personalized plan in seconds.
        </p>
        {conditions.length > 0 && (
  <p className="mt-2 font-mono text-xs text-base/50">
    Personalizing for: {conditions.join(", ")}
  </p>
)}
      </div>
      <div className="mt-10">
        <AIChat medicalConditions={conditions} />
      </div>
    </main>
  );
}