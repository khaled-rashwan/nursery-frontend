This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Multi-language Support**: English and Arabic locales
- **Public Forms**: Admissions, Careers, and Contact Us forms
- **Google reCAPTCHA Enterprise**: Advanced anti-spam protection with Service Account authentication
- **Firebase Backend**: Cloud Functions and Firestore database
- **Admin Portal**: Comprehensive management system
- **Teacher Portal**: Class management and homework tracking
- **Parent Portal**: View student information and communicate with teachers

## Google reCAPTCHA Enterprise Integration

All public forms (Admissions, Careers, Contact Us) are protected with **Google reCAPTCHA Enterprise** to prevent spam and automated submissions.

**Key Information**:
- **Site Key**: `6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25`
- **Environment Variable**: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (must be set in Vercel)
- **Authentication**: Uses Google Cloud Service Account (no secret keys needed)
- **API**: Calls `projects.assessments.create` for verification

**Setup Required**:
1. Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc1Y-orAAAAAB-fkrBM8xhIhu5WrZprgcgZVN25` in Vercel
2. Configure Cloud Functions with reCAPTCHA Enterprise service account
3. Deploy both frontend and backend

**Documentation**:
- **Reconfiguration Guide**: [RECAPTCHA_ENTERPRISE_RECONFIGURATION.md](./RECAPTCHA_ENTERPRISE_RECONFIGURATION.md) - Latest configuration updates
- Quick Start: [RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md](./RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md)
- Full Migration Guide: [RECAPTCHA_ENTERPRISE_MIGRATION.md](./RECAPTCHA_ENTERPRISE_MIGRATION.md)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

### Next.js Resources

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Project Documentation

- [RECAPTCHA_ENTERPRISE_RECONFIGURATION.md](./RECAPTCHA_ENTERPRISE_RECONFIGURATION.md) - Latest reCAPTCHA Enterprise reconfiguration (October 2025)
- [RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md](./RECAPTCHA_ENTERPRISE_QUICK_GUIDE.md) - Quick setup guide for reCAPTCHA Enterprise
- [RECAPTCHA_ENTERPRISE_MIGRATION.md](./RECAPTCHA_ENTERPRISE_MIGRATION.md) - Complete migration guide with troubleshooting
- [RECAPTCHA_IMPLEMENTATION.md](./RECAPTCHA_IMPLEMENTATION.md) - Legacy documentation (v2 implementation)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
