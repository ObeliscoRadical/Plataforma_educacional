# Escola online: segurança, matrículas e operação

Branch: `feat/escola-completa`. Tudo novo fica atrás de flags e de migrações idempotentes.

## Flags (variáveis de ambiente)

Flags seguras ligam por padrão. Para desligar, defina `false`.

| Variável | Padrão | Efeito |
|---|---|---|
| `FF_SECURE_ADMIN` | ligada | Rotas admin exigem login com papel ADMIN |
| `FF_DEMO_ENDPOINTS` | ligada | Endpoints de demonstração (ativação mock gratuita) ficam bloqueados |
| `FF_ENROLLMENT_GUARD` | ligada | Aula, progresso e tutor exigem matrícula ativa, checada no servidor |
| `FF_AUTH_RECOVERY` | ligada | Recuperação de senha e verificação de e-mail |
| `CORS_ORIGINS` | lista vazia | Origens permitidas, separadas por vírgula |
| `AUTH_RATE_MAX` | ver código | Limite de tentativas de login por janela |
| `MENTOR_RATE_MAX` | 20 | Mensagens por minuto em `/api/mentor/chat` |
| `STRIPE_WEBHOOK_SECRET` | vazio | Segredo da assinatura do webhook Stripe |
| `DB_PATH` | `./developer_os.sqlite` | Arquivo SQLite |

## Backup e rollback

Backup antes de qualquer mudança no banco:

```sh
sh backend/scripts/backup-db.sh [caminho-do-banco]
```

Rollback por fase, depois desligue a flag correspondente:

```sh
sqlite3 <banco> < backend/scripts/rollback-school-extras.sql   # auditoria, consentimentos, notas, certificados, reembolsos, denúncias
sqlite3 <banco> < backend/scripts/rollback-auth-tokens.sql     # FF_AUTH_RECOVERY=false
sqlite3 <banco> < backend/scripts/rollback-enrollments.sql     # FF_ENROLLMENT_GUARD=false
```

Os três scripts foram testados em cópia do banco: as tabelas novas somem, `users` e o restante ficam intactos, e o backup preserva o estado anterior.

## Regra de acesso

Aula, vídeo, progresso e resposta do tutor só passam com matrícula ativa, verificada a cada requisição. A aula 00.01 é a prévia pública. ADMIN sempre passa. Reembolso (`charge.refunded`) revoga a matrícula.

## Endpoints novos (prefixo `/api`)

- `GET /legal/:doc`, `POST /consents`
- `GET /me/data` (exportar dados), `DELETE /me/data` (apagar conta)
- `GET|POST /lessons/:lessonId/notes` (exige matrícula)
- `POST /certificates` (403 sem matrícula, 409 se curso incompleto), `GET /certificates/:code`
- `GET /admin/audit.csv`, `GET /admin/enrollments.csv` (ADMIN)
- `POST /mentor/report` (denunciar resposta do tutor)
- `POST /enrollments/redeem` (código de acesso)
- Recuperação de senha e verificação de e-mail em `/auth/*`
- `/video-engine/*` agora só para ADMIN

## Testes

```sh
cd backend && npx tsc --noEmit && npx vitest run
```

Os arquivos de teste rodam em série (`vitest.config.ts`) porque compartilham um SQLite.

## Pendências (P2)

Texto de aviso de IA no tutor, "Entrar com Google", CI no GitHub Actions, quiz final e perguntas e respostas, certificado em PDF, página de vendas e CRUD de catálogo no admin, IVA e fatura, Stripe real.
