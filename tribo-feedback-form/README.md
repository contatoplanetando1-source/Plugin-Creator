# Formulário de Feedback da Tribo

Formulário de feedback sobre as Learnings e a Tribo, com identidade visual da
V4 Company. Construído em Next.js 14 (App Router) + Tailwind CSS, pronto para
deploy na Vercel.

## Perguntas

1. Nome (obrigatório)
2. Contribuição das Learnings para o desenvolvimento profissional (escala 1–5, obrigatório)
3. O que poderia melhorar nas Learnings (opcional)
4. Contribuição da Tribo no dia a dia (escala 1–5, obrigatório)
5. Clareza das boas práticas da Tribo (escala 1–5, obrigatório)
6. Espaço para criatividade após a Tribo (escala 1–5, obrigatório)
7. Sugestões para plugins/ferramentas/processos (opcional)
8. Comentários adicionais (opcional)

Toda submissão é enviada automaticamente por e-mail para **jamilly@v4company.com**.

## Rodando localmente

```bash
cd tribo-feedback-form
npm install
cp .env.example .env.local   # preencha RESEND_API_KEY
npm run dev
```

Acesse http://localhost:3000.

## Envio de e-mail (Resend)

O envio é feito via [Resend](https://resend.com):

1. Crie uma conta gratuita em resend.com.
2. Gere uma API Key e defina como `RESEND_API_KEY` (localmente em `.env.local`,
   e no projeto da Vercel em **Settings → Environment Variables**).
3. Para enviar de qualquer domínio próprio (recomendado para produção),
   [verifique um domínio](https://resend.com/domains) da V4 (ex.:
   `feedback.v4company.com`) e defina `RESEND_FROM_EMAIL` com um remetente
   desse domínio, ex.: `Tribo V4 <feedback@v4company.com>`.
   - Sem domínio verificado, o remetente padrão `onboarding@resend.dev` só
     consegue entregar e-mails para o endereço dono da conta Resend — use
     apenas para testes.
4. O destinatário (`jamilly@v4company.com`) já está fixo no código
   (`app/api/submit/route.ts`).

## Deploy na Vercel

```bash
npm i -g vercel
vercel link
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL   # opcional
vercel deploy --prod
```

Ou conecte o repositório diretamente pelo dashboard da Vercel, definindo o
**Root Directory** como `tribo-feedback-form` e configurando as variáveis de
ambiente acima em **Settings → Environment Variables**.

## Identidade visual

Cores e tipografia seguem o [Brand Book da V4 Company](https://brand.v4company.com):

- Vermelho primário `#e50914` (com tons `#b20710`, `#80050b`, `#400306`)
- Neutros de `#000000` a `#ffffff`
- Acentos `#52cc5a` (verde) e `#ffc02a` (dourado)
- Tipografia Montserrat (alternativa livre à Proxima Nova usada pela marca)
