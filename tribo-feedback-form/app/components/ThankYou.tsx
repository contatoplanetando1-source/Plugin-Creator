"use client";

type ThankYouProps = {
  name: string;
  onReset: () => void;
};

export default function ThankYou({ name, onReset }: ThankYouProps) {
  const firstName = name.trim().split(" ")[0];

  return (
    <div className="animate-fade-in-up rounded-2xl bg-white p-8 text-center shadow-card sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-v4-green/15">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-8 w-8 text-v4-green"
          aria-hidden="true"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-extrabold text-v4-near-black sm:text-3xl">
        Obrigado{firstName ? `, ${firstName}` : ""}!
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-v4-charcoal/70 sm:text-base">
        Seu feedback foi enviado com sucesso e é muito importante para
        continuarmos evoluindo as Learnings e a Tribo. 💛
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex items-center justify-center rounded-full border border-v4-gray-light px-6 py-2.5 text-sm font-semibold text-v4-charcoal transition-colors hover:border-v4-red hover:text-v4-red"
      >
        Enviar outra resposta
      </button>
    </div>
  );
}
