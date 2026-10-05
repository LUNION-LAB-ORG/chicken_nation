FROM node:24-alpine AS base

# Variables publiques écrites dans le code à la construction. Elles viennent
# des « args » de compose.yml (lus dans le .env du serveur) : le .env lui-même
# n'entre plus dans l'image (.dockerignore), il ne sert qu'au démarrage
# (env_file), pour les secrets (Resend).
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_API_BACKEND_URL
ARG NEXT_PUBLIC_API_FILE_URL
ARG NEXT_PUBLIC_CLOUDFRONT_URL
ARG NEXT_PUBLIC_PLAY_STORE_LINK
ARG NEXT_PUBLIC_APP_STORE_LINK
ARG NEXT_PUBLIC_APP_SCHEMA

ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ENV NEXT_PUBLIC_API_BACKEND_URL=${NEXT_PUBLIC_API_BACKEND_URL}
ENV NEXT_PUBLIC_API_FILE_URL=${NEXT_PUBLIC_API_FILE_URL}
ENV NEXT_PUBLIC_CLOUDFRONT_URL=${NEXT_PUBLIC_CLOUDFRONT_URL}
ENV NEXT_PUBLIC_PLAY_STORE_LINK=${NEXT_PUBLIC_PLAY_STORE_LINK}
ENV NEXT_PUBLIC_APP_STORE_LINK=${NEXT_PUBLIC_APP_STORE_LINK}
ENV NEXT_PUBLIC_APP_SCHEMA=${NEXT_PUBLIC_APP_SCHEMA}

# Version de Bun figée (celle qui a écrit bun.lock) : une nouvelle version
# ne change plus l'installation d'un déploiement à l'autre.
ARG BUN_VERSION=1.3.9

ENV NODE_ENV="production"

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
# Ajout de bun.lockb* et bun.lock* pour supporter Bun
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* bun.lockb* bun.lock* .npmrc* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    elif [ -f bun.lockb ] || [ -f bun.lock ]; then npm install -g bun@${BUN_VERSION} && bun install --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Clé des actions serveur, FIXE d'un déploiement à l'autre (.env du serveur,
# à générer une fois : openssl rand -base64 32). Sans elle, chaque build tire
# une clé au hasard : les identifiants d'actions changent et les onglets
# ouverts (suivi de commande, panier) ne peuvent plus joindre le serveur.
# Déclarée ici seulement : l'image finale (runner) ne la contient pas en variable.
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY}
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

# Construction par Node, comme les contrôles du projet (plan, règle 9) :
# « bun run build » lance Next sous Bun, dont certaines versions plantent la
# construction. Node 24 est déjà dans l'image.
RUN node node_modules/next/dist/bin/next build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Code du serveur à root, en lecture seule pour l'utilisateur qui le fait
# tourner : un intrus ne peut ni le modifier ni y déposer un programme
# (incident du 19/09). Seuls les dossiers où Next écrit en marche lui
# appartiennent :
# - .next/server/route-cache : pages refaites toutes les N minutes. Next
#   16.3.8 les écrit là, et non dans .next/server/app : ce dossier ne contient
#   que le code des pages et reste donc à root. Sans route-cache modifiable,
#   chaque rafraîchissement échoue (« Failed to update prerender cache »,
#   EACCES) et la page n'est gardée qu'en mémoire ;
# - .next/cache : données et images optimisées (volume de compose.yml).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN mkdir -p .next/cache/images .next/server/route-cache \
    && chown -R nextjs:nodejs .next/cache .next/server/route-cache

USER nextjs

EXPOSE 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]