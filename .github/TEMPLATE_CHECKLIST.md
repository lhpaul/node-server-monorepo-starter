# Template Setup Checklist

Use this checklist to ensure you've completed all necessary steps when setting up your project from this template.

## 🔧 Project Configuration

- [ ] Update Firebase project IDs in `.firebaserc`
- [ ] Update environment constants in `packages/shared/src/constants/environments.constants.ts`
- [ ] Create Google Cloud projects (dev, staging, prod)
- [ ] Enable required Google Cloud APIs in all projects
- [ ] Authenticate with Google Cloud CLI (`gcloud auth login`)
- [ ] Authenticate with Firebase CLI (`firebase login`)

## 🔐 Environment & Secrets

- [ ] Copy `.env.example` files to `.env` in each app directory
- [ ] Update all environment variables in `.env` files
- [ ] Create secrets in Google Cloud Secret Manager
- [ ] Verify secrets are accessible in your applications

## 🏗️ Infrastructure

- [ ] Review and update Terraform variables in `infra/environments/*/variables.tf`
- [ ] Deploy infrastructure for development environment
- [ ] Deploy infrastructure for staging environment (if needed)
- [ ] Deploy infrastructure for production environment (if needed)

## 🚀 Initial Deployment

- [ ] Install all dependencies (`pnpm install`)
- [ ] Deploy Firestore configuration (`pnpm run deploy:firestore`)
- [ ] Deploy Cloud Functions (`pnpm run deploy:functions`)
- [ ] Deploy Internal API (`pnpm run deploy:internal-api`)
- [ ] Deploy Public API (`pnpm run deploy:public-api`)

## 📝 Documentation & Implementation

- [ ] Update `README.md` with your project-specific information
- [ ] Update contact information in README
- [ ] Customize `TODOs.md` with your project tasks
- [ ] Review and customize conventions in `/conventions` folder
- [ ] Implement your domain models and services
- [ ] Create your API endpoints
- [ ] Test development servers (`pnpm run dev:internal-api`, `pnpm run dev:public-api`)
- [ ] Run tests (`pnpm run test`)

## 🧹 Final Cleanup

- [ ] Remove this checklist file (`.github/TEMPLATE_CHECKLIST.md`)
- [ ] Remove `SETUP.md` (if you've completed all steps)
- [ ] Commit all your changes
- [ ] Push to your repository

## ✅ Verification

- [ ] All applications start without errors
- [ ] All tests pass
- [ ] Environment variables are properly configured
- [ ] No hardcoded project-specific values remain
- [ ] Documentation is up-to-date

---

**Note**: Check off each item as you complete it. This checklist helps ensure you don't miss any important setup steps when creating a new project from this template.

