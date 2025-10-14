# Neatrix Cleaning Service Platform

A comprehensive cleaning service platform with separate user-facing and admin applications.

## Project Structure

```
├── user-frontend/          # Main customer-facing application
├── admin-dashboard/        # Admin dashboard for managing services
├── shared/                 # Shared utilities and configurations
├── supabase/              # Database schema and configurations
└── README.md              # This file
```

## Applications

### 1. User Frontend (Main App)
- **Location**: `user-frontend/`
- **Description**: Customer-facing application for booking cleaning services
- **Port**: 5173 (development)
- **Build Command**: `npm run build`
- **Start Command**: `npm run dev`

### 2. Admin Dashboard
- **Location**: `admin-dashboard/`
- **Description**: Administrative interface for managing bookings, users, and services
- **Port**: 8081 (development)
- **Build Command**: `npm run build`
- **Start Command**: `npm run dev`

### 3. Shared Library
- **Location**: `shared/`
- **Description**: Common utilities, types, and configurations used by both applications
- **Includes**: Supabase client, TypeScript types, utility functions

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Recent Updates

### Email Verification Enhancement
- ✅ Created professional HTML email template for signup confirmation
- ✅ Added EmailVerificationSuccessPage with modern UI
- ✅ Updated routing to include success page
- ✅ Added comprehensive documentation for Supabase configuration

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cleaning-service-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Email Template Setup
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** template
4. Replace with content from `src/email-templates/verification-email.html`
5. Update redirect URLs to include `/email-verification-success`

See `supabase-email-config.md` for detailed configuration instructions.

### 5. Run Development Server
```bash
npm run dev
```

## Deployment

### GitHub Repository Setup
1. Create a new repository on GitHub
2. Add the remote origin:
   ```bash
   git remote add origin https://github.com/yourusername/cleaning-service-website.git
   git branch -M main
   git push -u origin main
   ```

### Vercel Deployment

#### Main Application (Customer-facing)
1. Connect your GitHub repository to Vercel
2. Use the default `vercel.json` configuration
3. Configure environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automatically on every push to main branch

#### Admin Dashboard (Separate deployment)
1. Create a second Vercel project for the admin dashboard
2. Use `vercel-admin.json` as the configuration file:
   ```bash
   vercel --local-config vercel-admin.json
   ```
3. Configure the same environment variables
4. Deploy with admin-specific build command: `npm run build:admin`

#### Build Commands
- **Main App**: `npm run build` (outputs to `dist/`)
- **Admin Dashboard**: `npm run build:admin` (outputs to `neatrixadmin/dist/`)
- **Development**: 
  - Main: `npm run dev`
  - Admin: `npm run dev:admin`

#### Environment Variables Required
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Security Features
- Content Security Policy headers
- XSS protection
- Frame options for clickjacking prevention
- Asset caching optimization

## Email Template Features

### Professional Design
- Clean, modern layout with CleanPro branding
- Mobile-responsive design
- Professional color scheme (blue gradient)

### Enhanced Content
- Welcoming tone with clear call-to-action
- Service highlights and benefits
- Multiple contact options (phone, WhatsApp, email)
- Security information (24-hour expiration)

### User Experience
- Large, prominent verification button
- Alternative text link for accessibility
- Clear instructions and next steps
- Professional footer with company information

## Success Page Features

### Dynamic Content
- Auto-redirect for authenticated users
- Countdown timer for better UX
- Personalized welcome message

### Action Items
- Clear next steps for new users
- Direct links to dashboard and services
- Welcome bonus code for first-time users

### Support Integration
- Multiple contact methods
- Help resources
- Professional support messaging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email contactneatrix@gmail.com or contact us through the website.

---

Built with ❤️ for professional cleaning services
