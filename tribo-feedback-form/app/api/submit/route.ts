import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const DESTINATION_EMAIL = "jamilly@v4company.com";

type FeedbackPayload = {
  nome: string;
  learningsScore: number | null;
  learningsMelhorias: string;
  triboDiaADia: number | null;
  boasPraticasClaras: number | null;
  espacoCriativo: number | null;
  sugestoesPluginsFerramentas: string;
  comentariosAdicionais: string;
};

const SATISFACTION_LABELS: Record<number, string> = {
  1: "Muito insatisfeito",
  2: "Insatisfeito",
  3: "Neutro",
  4: "Satisfeito",
  5: "Muito satisfeito",
};

const AGREEMENT_LABELS: Record<number, string> = {
  1: "Discordo totalmente",
  2: "Discordo",
  3: "Neutro",
  4: "Concordo",
  5: "Concordo totalmente",
};

const CLARITY_LABELS: Record<number, string> = {
  1: "Nada claras",
  2: "Pouco claras",
  3: "Neutras",
  4: "Claras",
  5: "Muito claras",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function scoreRow(score: number | null, labels: Record<number, string>) {
  if (!score) return "—";
  return `${score}/5 · ${labels[score]}`;
}

function buildEmailHtml(data: FeedbackPayload) {
  const rows = [
    ["Nome", escapeHtml(data.nome)],
    [
      "Contribuição das Learnings",
      scoreRow(data.learningsScore, SATISFACTION_LABELS),
    ],
    [
      "O que poderia melhorar nas Learnings",
      escapeHtml(data.learningsMelhorias) || "—",
    ],
    [
      "Tribo no dia a dia",
      scoreRow(data.triboDiaADia, AGREEMENT_LABELS),
    ],
    [
      "Clareza das boas práticas",
      scoreRow(data.boasPraticasClaras, CLARITY_LABELS),
    ],
    [
      "Espaço para criatividade",
      scoreRow(data.espacoCriativo, AGREEMENT_LABELS),
    ],
    [
      "Sugestões para plugins/ferramentas/processos",
      escapeHtml(data.sugestoesPluginsFerramentas) || "—",
    ],
    [
      "Comentários adicionais",
      escapeHtml(data.comentariosAdicionais) || "—",
    ],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 16px;background:#f5f5f6;font-weight:600;color:#1a1a1a;font-size:13px;width:38%;border-bottom:1px solid #e5e5e5;vertical-align:top;">${label}</td>
          <td style="padding:12px 16px;color:#333333;font-size:13px;border-bottom:1px solid #e5e5e5;vertical-align:top;white-space:pre-wrap;">${value}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f5f6;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:#e50914;padding:20px 24px;">
        <p style="margin:0;color:#ffffff;font-size:16px;font-weight:800;letter-spacing:0.5px;">V4 COMPANY · TRIBO</p>
      </div>
      <div style="padding:24px;">
        <h1 style="margin:0 0 4px;font-size:18px;color:#1a1a1a;">Nova resposta do Feedback da Tribo</h1>
        <p style="margin:0 0 20px;font-size:13px;color:#666;">Recebida em ${new Date().toLocaleString(
          "pt-BR",
          { timeZone: "America/Sao_Paulo" }
        )}</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
          ${rowsHtml}
        </table>
      </div>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  let payload: FeedbackPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  if (!payload?.nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }
  if (!payload.learningsScore || !payload.triboDiaADia || !payload.boasPraticasClaras || !payload.espacoCriativo) {
    return NextResponse.json(
      { error: "Todas as perguntas obrigatórias precisam de uma resposta." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada.");
    return NextResponse.json(
      { error: "Envio de e-mail não configurado. Contate o administrador." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "Tribo V4 <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: DESTINATION_EMAIL,
      subject: `Novo feedback da Tribo — ${payload.nome}`,
      html: buildEmailHtml(payload),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Não foi possível enviar seu feedback. Tente novamente em instantes." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Unexpected error sending email:", err);
    return NextResponse.json(
      { error: "Não foi possível enviar seu feedback. Tente novamente em instantes." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
