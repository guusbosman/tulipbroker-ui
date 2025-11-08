# 🌷 TulipBroker UI

**TulipBroker UI** is the front-end of the TulipBroker system — a simulated stock trading and resiliency-testing environment.  
It’s a lightweight **React + Vite** web application designed for modern, low-latency deployment on **AWS S3 + CloudFront**.

---

## 🚀 Overview

| Component | Description |
|------------|-------------|
| **React + Vite** | Core frontend framework with fast build times. |
| **AWS S3** | Hosts static site assets. |
| **CloudFront** | Provides HTTPS, caching, and custom domain (e.g., `tulips-qa.guusbosman.com`). |
| **CloudFormation** | Infrastructure as Code template for repeatable deployments. |
| **GitHub Actions / Local CLI** | Can automate deployment to QA or production environments. |

---

## 📁 Directory Structure

```
tulipbroker-ui/
├─ public/                     # Static assets
├─ src/
│  ├─ components/              # UI components (buttons, panels, tables)
│  ├─ pages/                   # Page-level React components
│  ├─ hooks/                   # Custom React hooks
│  ├─ services/                # API clients and data logic
│  ├─ styles/                  # CSS or Tailwind files
│  ├─ App.tsx                  # Main React app entry point
│  ├─ main.tsx                 # Vite entrypoint
│  └─ vite-env.d.ts            # TypeScript environment types
├─ infra/
│  └─ ui.yaml                  # AWS CloudFormation template (S3 + CloudFront + OAC)
├─ scripts/
│  └─ deploy.sh                # Script to build and deploy to AWS
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## 🧩 Key Features

- **Broker Simulation UI** — visual mock trading interface for demo and testing.
- **Dynamic Config Fetch** — connects to backend `/api/config` to show region and version.
- **Auto Build + Deploy** — single-step AWS deployment via CloudFormation.
- **Environment-Aware** — easily deploy multiple environments (`qa`, `prod`, etc.).

---

## ⚙️ Deployment Steps

### 1. Prerequisites

- AWS CLI configured with valid credentials (`aws configure sso` recommended)
- Node.js 18+ and npm
- CloudFormation template (`infra/ui.yaml`) ready

### 2. Build the UI

```bash
npm install
npm run build
```

This creates the optimized production build under `dist/`.

### 3. Deploy via CloudFormation

```bash
aws cloudformation deploy   --template-file infra/ui.yaml   --stack-name paperbroker-ui-qa   --parameter-overrides Project=paperbroker-ui Env=qa
```

Once completed, note the output value for the **CloudFrontDomain**.

### 4. Upload UI Assets

```bash
aws s3 sync dist/ s3://paperbroker-ui-qa-assets --delete
aws cloudfront create-invalidation --distribution-id <YOUR_DISTRIBUTION_ID> --paths "/*"
```

### 5. Test Access

Once DNS propagation finishes, open:

```
https://tulips-qa.guusbosman.com
```

---

## 🧠 Environment Variables

When building locally, the following environment variables can be set in a `.env` file:

| Variable | Example | Description |
|-----------|----------|-------------|
| `VITE_API_URL` | `https://abc123.execute-api.us-east-2.amazonaws.com` | Backend API base URL |
| `VITE_APP_VERSION` | `0.1.0` | UI version displayed in footer |
| `VITE_UI_BUILD_TIME` | `2024-02-10T19:45:00Z` | Optional UTC stamp injected at build; auto-set by `scripts/deploy.sh` |
| `VITE_ENV` | `qa` | Environment identifier (qa, prod, etc.) |

Example `.env.qa` file:

```
VITE_API_URL=https://abc123.execute-api.us-east-2.amazonaws.com
VITE_APP_VERSION=0.1.0
VITE_UI_BUILD_TIME=2024-02-10T19:45:00Z
VITE_ENV=qa
```

---

## 🧹 Cleanup

To remove all QA infrastructure:

```bash
aws cloudformation delete-stack --stack-name paperbroker-ui-qa
aws s3 rb s3://paperbroker-ui-qa-assets --force
```

---

## 🔮 Future Roadmap

- [ ] Integrate backend trading simulation API
- [ ] Add mock portfolio view
- [ ] Add CI/CD GitHub Actions deployment pipeline
- [ ] Implement user authentication (Cognito)
- [ ] Enhance UI with Tailwind animations and theming

---

## 👨‍💻 Author

**Guus Bosman**  
Created as part of the **TulipBroker Project**  
Focus: Fast, visual, and cloud-native experimentation.

---

### License
MIT License © 2025 Guus Bosman
