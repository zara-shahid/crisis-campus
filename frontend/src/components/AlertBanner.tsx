interface Props {
  label: string;
  message: string;
  tone?: "danger" | "warning" | "action";
}

const TONE_STYLES = {
  danger: "bg-danger",
  warning: "bg-warning",
  action: "bg-action",
};

export default function AlertBanner({ label, message, tone = "danger" }: Props) {
  return (
    <div
      className={`relative overflow-hidden ${TONE_STYLES[tone]} scan-sweep`}
      style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-2.5 text-center">
        <span className="rounded-sm bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
          {label}
        </span>
        <span className="font-mono text-xs uppercase tracking-wide text-white sm:text-sm">
          {message}
        </span>
      </div>
    </div>
  );
}