This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Multi-language Support**: English and Arabic locales
- **Public Forms**: Admissions, Careers, and Contact Us forms
- **Google reCAPTCHA v2**: Anti-spam protection for all public forms
- **Firebase Backend**: Cloud Functions and Firestore database
- **Admin Portal**: Comprehensive management system
- **Teacher Portal**: Class management and homework tracking
- **Parent Portal**: View student information and communicate with teachers

## Google reCAPTCHA Integration

All public forms (Admissions, Careers, Contact Us) are protected with Google reCAPTCHA v2 to prevent spam and automated submissions.

**Setup Required**: Before the forms will work, you need to configure reCAPTCHA keys:
1. Create reCAPTCHA keys at https://www.google.com/recaptcha/admin
2. Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` to your environment variables
3. Configure Firebase Functions with the secret key

For detailed setup instructions, see [RECAPTCHA_SETUP_GUIDE.md](./RECAPTCHA_SETUP_GUIDE.md)

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

- [RECAPTCHA_SETUP_GUIDE.md](./RECAPTCHA_SETUP_GUIDE.md) - Complete guide for setting up Google reCAPTCHA
- [RECAPTCHA_IMPLEMENTATION.md](./RECAPTCHA_IMPLEMENTATION.md) - Technical details of the reCAPTCHA integration

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
