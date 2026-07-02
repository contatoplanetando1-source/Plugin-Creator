"use client";

import { useState } from "react";
import Field from "./Field";
import RatingScale from "./RatingScale";
import ThankYou from "./ThankYou";

type FormState = {
  nome: string;
  learningsScore: number | null;
  learningsMelhorias: string;
  triboDiaADia: number | null;
  boasPraticasClaras: number | null;
  espacoCriativo: number | null;
  sugestoesPluginsFerramentas: string;
  comentariosAdicionais: string;
};

const INITIAL_STATE: FormState = {
  nome: "",
  learningsScore: null,
  learningsMelhorias: "",
  triboDiaADia: null,
  boasPraticasClaras: null,
  espacoCriativo: null,
  sugestoesPluginsFerramentas: "",
  comentariosAdicionais: "",
};

const satisfactionLabels: [string, string, string, string, string] = [
  "Muito insatisfeito",
  "Insatisfeito",
  "Neutro",
  "Satisfeito",
  "Muito satisfeito",
];

const agreementLabels: [string, string, string, string, string] = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente",
];

const clarityLabels: [string, string, string, string, string] = [
  "Nada claras",
  "Pouco claras",
  "Neutras",
  "Claras",
  "Muito claras",
];

type Errors = Partial<Record<keyof FormState, string>>;

export default function FeedbackForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!form.nome.trim()) next.nome = "Por favor, informe seu nome.";
    if (!form.learningsScore) next.learningsScore = "Selecione uma nota de 1 a 5.";
    if (!form.triboDiaADia) next.triboDiaADia = "Selecione uma nota de 1 a 5.";
    if (!form.boasPraticasClaras)
      next.boasPraticasClaras = "Selecione uma nota de 1 a 5.";
    if (!form.espacoCriativo) next.espacoCriativo = "Selecione uma nota de 1 a 5.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      const firstErrorKey = Object.keys(validation)[0];
      document
        .getElementById(`field-${firstErrorKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível enviar seu feedback.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar seu feedback. Tente novamente."
      );
    }
  }

  function handleReset() {
    setForm(INITIAL_STATE);
    setErrors({});
    setStatus("idle");
  }

  if (status === "success") {
    return <ThankYou name={form.nome} onReset={handleReset} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-card sm:p-10"
      noValidate
    >
      <div id="field-nome">
        <Field number={1} title="Nome" required>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => update("nome", e.target.value)}
            placeholder="Digite seu nome completo"
            className={[
              "w-full rounded-lg border bg-v4-gray-light/30 px-4 py-2.5 text-sm text-v4-near-black outline-none transition-all duration-200 placeholder:text-v4-charcoal/40 focus:-translate-y-0.5 focus:border-v4-red focus:bg-white focus:shadow-md focus:ring-2 focus:ring-v4-red/15",
              errors.nome ? "border-v4-red" : "border-v4-gray-light",
            ].join(" ")}
          />
        </Field>
      </div>

      <div id="field-learningsScore">
        <Field
          number={2}
          title="O quanto as nossas Learnings têm contribuído para o seu desenvolvimento profissional?"
          required
          error={errors.learningsScore}
        >
          <RatingScale
            name="learningsScore"
            value={form.learningsScore}
            onChange={(v) => update("learningsScore", v)}
            labels={satisfactionLabels}
            error={!!errors.learningsScore}
          />
        </Field>
      </div>

      <Field number={3} title="O que poderíamos melhorar nas Learnings?">
        <input
          type="text"
          value={form.learningsMelhorias}
          onChange={(e) => update("learningsMelhorias", e.target.value)}
          placeholder="Sua resposta"
          className="w-full rounded-lg border border-v4-gray-light bg-v4-gray-light/30 px-4 py-2.5 text-sm text-v4-near-black outline-none transition-all duration-200 placeholder:text-v4-charcoal/40 focus:-translate-y-0.5 focus:border-v4-red focus:bg-white focus:shadow-md focus:ring-2 focus:ring-v4-red/15"
        />
      </Field>

      <div id="field-triboDiaADia">
        <Field
          number={4}
          title="Você sente que a Tribo tem contribuído para melhorar o seu trabalho no dia a dia?"
          required
          error={errors.triboDiaADia}
        >
          <RatingScale
            name="triboDiaADia"
            value={form.triboDiaADia}
            onChange={(v) => update("triboDiaADia", v)}
            labels={agreementLabels}
            error={!!errors.triboDiaADia}
          />
        </Field>
      </div>

      <div id="field-boasPraticasClaras">
        <Field
          number={5}
          title="As boas práticas da Tribo ficaram claras para você?"
          required
          error={errors.boasPraticasClaras}
        >
          <RatingScale
            name="boasPraticasClaras"
            value={form.boasPraticasClaras}
            onChange={(v) => update("boasPraticasClaras", v)}
            labels={clarityLabels}
            error={!!errors.boasPraticasClaras}
          />
        </Field>
      </div>

      <div id="field-espacoCriativo">
        <Field
          number={6}
          title="Você sente que passou a ter mais espaço para ser criativo(a) após participar da Tribo?"
          required
          error={errors.espacoCriativo}
        >
          <RatingScale
            name="espacoCriativo"
            value={form.espacoCriativo}
            onChange={(v) => update("espacoCriativo", v)}
            labels={agreementLabels}
            error={!!errors.espacoCriativo}
          />
        </Field>
      </div>

      <div
        className="animate-fade-in-up flex items-center gap-3 pb-1 pt-7 opacity-0"
        style={{ animationDelay: "460ms" }}
      >
        <span className="h-px flex-1 bg-v4-gray-light" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-v4-red">
          Para fechar
        </span>
        <span className="h-px flex-1 bg-v4-gray-light" />
      </div>

      <Field
        number={7}
        title="Você tem sugestões de melhorias para plugins, ferramentas ou processos que utilizamos?"
      >
        <textarea
          value={form.sugestoesPluginsFerramentas}
          onChange={(e) => update("sugestoesPluginsFerramentas", e.target.value)}
          placeholder="Sua resposta"
          rows={4}
          className="w-full resize-y rounded-lg border border-v4-gray-light bg-v4-gray-light/30 px-4 py-2.5 text-sm text-v4-near-black outline-none transition-all duration-200 placeholder:text-v4-charcoal/40 focus:-translate-y-0.5 focus:border-v4-red focus:bg-white focus:shadow-md focus:ring-2 focus:ring-v4-red/15"
        />
      </Field>

      <Field
        number={8}
        title="Comentários ou sugestões adicionais"
        helperText="Opcional"
      >
        <textarea
          value={form.comentariosAdicionais}
          onChange={(e) => update("comentariosAdicionais", e.target.value)}
          placeholder="Sua resposta"
          rows={4}
          className="w-full resize-y rounded-lg border border-v4-gray-light bg-v4-gray-light/30 px-4 py-2.5 text-sm text-v4-near-black outline-none transition-all duration-200 placeholder:text-v4-charcoal/40 focus:-translate-y-0.5 focus:border-v4-red focus:bg-white focus:shadow-md focus:ring-2 focus:ring-v4-red/15"
        />
      </Field>

      {status === "error" && (
        <div className="mt-6 rounded-lg border border-v4-red/30 bg-v4-red/5 px-4 py-3 text-sm text-v4-red">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-v4-red px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-v4-red/20 transition-all hover:bg-v4-red-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === "submitting" ? "Enviando..." : "Enviar feedback"}
      </button>
    </form>
  );
}
