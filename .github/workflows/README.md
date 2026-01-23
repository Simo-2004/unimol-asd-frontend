# GitHub Actions CI/CD Pipeline

Questa directory contiene i workflow di GitHub Actions per l'automazione del progetto **unimol-asd-frontend**.

## 📋 Workflow Disponibili

### 1. **CI Pipeline** (`ci.yml`)
**Trigger:** Push e Pull Request su `main` e `develop`

Pipeline di Continuous Integration completa che include:

- **🔍 Lint Code**: Analisi del codice con ESLint
- **🔎 Type Check**: Verifica dei tipi con TypeScript
- **🔒 Security Audit**: Controllo delle vulnerabilità con `pnpm audit`
- **🏗️ Build Application**: Build dell'applicazione Next.js
- **🐳 Build Docker Image**: Build dell'immagine Docker
- **📊 Code Quality Analysis**: Metriche e analisi del codice
- **📦 Dependency Analysis**: Controllo delle dipendenze
- **✅ CI Summary**: Riepilogo finale di tutti i job

**Features:**
- Caching ottimizzato per pnpm
- Esecuzione parallela dei job indipendenti
- Upload degli artifact di build
- Cache Docker per build più veloci

### 2. **CD - Deploy to Production** (`cd.yml`)
**Trigger:** Push su `main`, tag `v*.*.*`, o manualmente

Pipeline di Continuous Deployment:

- **🚀 Build and Push Docker Image**: 
  - Build multi-architettura (amd64, arm64)
  - Push automatico su GitHub Container Registry
  - Tagging automatico basato su branch/tag/SHA
  
- **📝 Create Release**: 
  - Creazione automatica di GitHub Release per i tag
  - Note di rilascio generate automaticamente

**Permessi richiesti:**
- `contents: write` per creare release
- `packages: write` per pubblicare immagini Docker

### 3. **PR Check** (`pr-check.yml`)
**Trigger:** Apertura, sincronizzazione o riapertura di Pull Request

Controlli specifici per le PR:

- **🔍 PR Quality Check**:
  - Esecuzione di lint, type check e build
  - Analisi della dimensione della PR
  - Commento automatico sulla PR

- **🔴 Breaking Changes Check**:
  - Rilevamento di modifiche a file critici
  - Segnalazione di potenziali breaking changes

### 4. **Performance Analysis** (`performance.yml`)
**Trigger:** Pull Request e push su `main`

Analisi delle performance:

- **📦 Bundle Size Analysis**:
  - Analisi della dimensione del bundle
  - Warning per build superiori a 100MB
  - Report dettagliato sui file statici

- **🔦 Lighthouse Audit**:
  - Audit delle performance con Lighthouse
  - Controllo accessibilità e best practices

## 🚀 Come Usare

### Setup Iniziale

1. **Abilita GitHub Actions** nel repository
2. **Configura i Secrets** (se necessario per il deploy):
   - `GITHUB_TOKEN` è disponibile automaticamente
   - Aggiungi altri secrets dal menu Settings → Secrets and variables → Actions

### Per il CI automatico

Semplicemente:
- Fai push sul branch `main` o `develop`
- Apri una Pull Request
- I workflow si avvieranno automaticamente

### Per il Deploy manuale

1. Vai su Actions nel repository GitHub
2. Seleziona "CD - Deploy to Production"
3. Clicca su "Run workflow"
4. Seleziona il branch
5. Clicca su "Run workflow"

### Per creare una Release

```bash
# Crea e pusha un tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Il workflow creerà automaticamente:
- Build Docker con tag `v1.0.0`, `1.0`, e `latest`
- GitHub Release con note auto-generate

## 📊 Badge Status

Aggiungi questi badge al README principale:

```markdown
![CI Pipeline](https://github.com/USERNAME/unimol-asd-frontend/workflows/CI%20Pipeline/badge.svg)
![CD Pipeline](https://github.com/USERNAME/unimol-asd-frontend/workflows/CD%20-%20Deploy%20to%20Production/badge.svg)
```

## 🔧 Configurazione

### Variabili d'Ambiente

I workflow utilizzano queste variabili:
- `NODE_VERSION: '20'` - Versione di Node.js
- `PNPM_VERSION: '8'` - Versione di pnpm
- `REGISTRY: ghcr.io` - Registry per le immagini Docker
- `IMAGE_NAME: ${{ github.repository }}` - Nome dell'immagine Docker

### Modifica dei Workflow

Per personalizzare i workflow:

1. **Cambiare i branch trigger**:
   ```yaml
   on:
     push:
       branches: [ main, develop, your-branch ]
   ```

2. **Aggiungere nuovi job**:
   ```yaml
   your-job:
     name: Your Job Name
     runs-on: ubuntu-latest
     needs: [other-job]  # opzionale: dipendenze
     steps:
       - uses: actions/checkout@v4
       # ... altri step
   ```

3. **Modificare le versioni**:
   Aggiorna le variabili `env` all'inizio del file

## 📦 Tool di Analisi Integrati

1. **ESLint** - Linting del codice
2. **TypeScript Compiler** - Type checking
3. **pnpm audit** - Security vulnerabilities
4. **Docker Buildx** - Multi-platform builds
5. **Code metrics** - Analisi quantitativa del codice
6. **Bundle analysis** - Dimensione del bundle
7. **Lighthouse** - Performance audit

## 🎯 Best Practices

1. **Mantieni i workflow veloci**:
   - Usa caching quando possibile
   - Esegui job in parallelo se indipendenti
   - Limita la profondità di `git fetch`

2. **Sicurezza**:
   - Non committare secrets nel codice
   - Usa `GITHUB_TOKEN` quando possibile
   - Specifica `permissions` minime necessarie

3. **Manutenzione**:
   - Aggiorna regolarmente le versioni delle actions
   - Monitora i workflow deprecati
   - Rivedi i log per ottimizzazioni

## 🐛 Troubleshooting

### Build fallisce su TypeScript
```bash
# Localmente, esegui:
pnpm exec tsc --noEmit
```

### Docker build fallisce
```bash
# Testa localmente:
docker build -f Dockerfile.prod -t test .
```

### pnpm install lento
- Verifica che il caching sia abilitato
- Controlla che `pnpm-lock.yaml` sia committato

## 📚 Risorse

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [pnpm CI Setup](https://pnpm.io/continuous-integration)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Multi-platform builds](https://docs.docker.com/build/building/multi-platform/)

## 🤝 Contribuire

Per modificare i workflow:

1. Crea un branch da `develop`
2. Modifica i file in `.github/workflows/`
3. Testa le modifiche (i workflow si attiveranno automaticamente)
4. Apri una Pull Request
5. Verifica che tutti i check passino

---

**Nota**: Questi workflow sono configurati per il progetto unimol-asd-frontend. Adattali secondo le tue esigenze specifiche.
