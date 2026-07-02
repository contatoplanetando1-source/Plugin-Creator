"use client";

type FieldProps = {
  number: number;
  title: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
};

export default function Field({
  number,
  title,
  required,
  helperText,
  error,
  children,
}: FieldProps) {
  return (
    <div
      className="animate-fade-in-up border-b border-v4-gray-light py-7 opacity-0 first:pt-0 last:border-b-0 last:pb-0"
      style={{ animationDelay: `${Math.min(number, 8) * 70}ms` }}
    >
      <div className="mb-4 flex gap-3">
        <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-v4-near-black text-xs font-bold text-white transition-transform duration-300">
          {number}
        </span>
        <div>
          <h2 className="text-[15px] font-semibold leading-snug text-v4-near-black sm:text-base">
            {title}
            {required && <span className="ml-1 text-v4-red">*</span>}
          </h2>
          {helperText && (
            <p className="mt-1 text-xs text-v4-charcoal/60">{helperText}</p>
          )}
        </div>
      </div>
      <div className="pl-9">{children}</div>
      {error && (
        <p className="mt-2 pl-9 text-xs font-medium text-v4-red">{error}</p>
      )}
    </div>
  );
}
