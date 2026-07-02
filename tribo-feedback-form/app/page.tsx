import FeedbackForm from "./components/FeedbackForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-v4-gray-light/40">
      <div className="h-2 w-full bg-gradient-to-r from-v4-red via-v4-red-dark to-v4-red-darker" />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-v4-near-black text-lg font-extrabold text-white">
            V4
          </div>
          <h1 className="text-2xl font-extrabold leading-tight text-v4-near-black sm:text-4xl">
            Formulário de Feedback da Tribo
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-v4-charcoal/70 sm:text-base">
            Sua opinião ajuda a construir Learnings melhores e uma Tribo cada
            vez mais forte. Leva menos de 3 minutos.
          </p>
        </header>

        <FeedbackForm />

        <footer className="mt-8 text-center text-xs text-v4-charcoal/50">
          V4 Company · Suas respostas são enviadas automaticamente para a
          equipe responsável.
        </footer>
      </div>
    </main>
  );
}
