# EduPay Frontend

A modern school payment and student management platform built with React.

## Features

- **Landing Page**: Beautiful, responsive landing page showcasing EduPay's features
- **Authentication**: Sign in and sign up pages with role-based registration
- **Modern UI**: Built with Tailwind CSS for a clean, professional design
- **Responsive Design**: Mobile-first approach with container queries support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── pages/
│   ├── LandingPage.jsx          # Main landing page
│   └── Auth/                    # Authentication pages
│       ├── SignInPage.jsx       # Sign in page
│       ├── SignUpPage.jsx       # Sign up page
│       ├── Login.jsx            # Legacy login page
│       ├── Register.jsx         # Legacy register page
│       └── ForgotPassword.jsx   # Password recovery
├── app/
│   └── AppRouter.jsx            # Main routing configuration
├── components/                   # Reusable UI components
├── contexts/                     # React contexts (Auth, etc.)
└── index.css                    # Global styles with Tailwind CSS
```

## Pages

### Landing Page (`/`)
- Modern, responsive design
- Showcases key features and benefits
- Call-to-action buttons for sign up
- Testimonials section
- Professional footer

### Sign In (`/auth/login`)
- Clean authentication form
- Email and password fields
- Remember me functionality
- Social login options (Google, Twitter)
- Link to sign up page

### Sign Up (`/auth/register`)
- Comprehensive registration form
- First name, last name, email
- Role selection (Student, Parent, Teacher, Admin, Cashier)
- Password confirmation
- Terms and conditions agreement
- Social sign up options

## Styling

The project uses **Tailwind CSS** with the following plugins:
- `@tailwindcss/container-queries` - For responsive container queries
- `@tailwindcss/forms` - For better form styling

### Color Scheme
- Primary: `#0d78f2` (Blue)
- Text: `#0d141c` (Dark)
- Secondary Text: `#49709c` (Medium Blue)
- Borders: `#cedae8` (Light Blue)
- Background: `#e7edf4` (Very Light Blue)

### Typography
- **Inter** - Primary font for headings and body text
- **Noto Sans** - Fallback font

## Routing

The application uses React Router v7 with the following structure:
- `/` - Landing page
- `/auth/login` - Sign in page
- `/auth/register` - Sign up page
- `/app/*` - Protected application routes

## Development

### Adding New Pages
1. Create the page component in `src/pages/`
2. Add the route to `src/app/AppRouter.jsx`
3. Import and use the page

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the established color scheme
- Ensure responsive design with container queries
- Use the Inter font family for consistency

## Build and Deploy

The application builds successfully and can be deployed to any static hosting service. The build output is optimized and includes:

- Minified JavaScript bundles
- Optimized CSS with Tailwind
- Static assets ready for deployment

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Container queries support for advanced layouts
