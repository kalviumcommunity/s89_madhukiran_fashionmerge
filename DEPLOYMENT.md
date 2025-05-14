# FashionMerge Deployment Guide

This guide provides instructions for deploying the FashionMerge application, including both the frontend and backend components.

## Backend Deployment

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or other MongoDB hosting
- Cloudinary account (for image uploads)
- Google OAuth credentials (for social login)

### Steps for Backend Deployment

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd s89_madhukiran_fashionmerge-1
   ```

2. **Set up environment variables**
   - Copy the `.env.example` file to `.env` in the server directory
   ```
   cd server
   cp .env.example .env
   ```
   - Edit the `.env` file with your actual values:
     - Set `NODE_ENV=production`
     - Add your MongoDB connection string
     - Set a secure JWT secret
     - Add your Google OAuth credentials
     - Add your Cloudinary credentials
     - Set `BACKEND_URL` to your deployed backend URL
     - Set `FRONTEND_URL` to your deployed frontend URL

3. **Install dependencies**
   ```
   npm install
   ```

4. **Deploy to your hosting provider**
   - For Heroku:
     ```
     heroku create your-app-name
     git push heroku main
     ```
   - For Render, Vercel, or other platforms, follow their specific deployment instructions

5. **Verify deployment**
   - Check that your backend is running by visiting the URL
   - Test the API endpoints to ensure they're working correctly

## Frontend Deployment

### Prerequisites
- Node.js (v14 or higher)
- Netlify, Vercel, or other static site hosting account

### Steps for Frontend Deployment

1. **Update API configuration**
   - Open `client/src/config/api.js`
   - Update the `BASE_URL` in production to point to your deployed backend URL:
   ```javascript
   const BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-deployed-backend-url.com' // Replace with your actual deployed backend URL
     : 'http://localhost:5000';
   ```

2. **Install dependencies**
   ```
   cd client
   npm install
   ```

3. **Build the frontend**
   ```
   npm run build
   ```

4. **Deploy to your hosting provider**
   - For Netlify:
     ```
     netlify deploy --prod
     ```
   - For Vercel or other platforms, follow their specific deployment instructions

5. **Verify deployment**
   - Check that your frontend is running by visiting the URL
   - Test the application functionality to ensure it's working correctly

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your backend has CORS configured correctly to allow requests from your frontend domain
   - Check that the `FRONTEND_URL` in your backend `.env` file is correct

2. **Authentication Issues**
   - Verify that your Google OAuth callback URL is correctly set in the Google Developer Console
   - Check that the `BACKEND_URL` in your `.env` file matches the actual deployed URL

3. **Database Connection Issues**
   - Ensure your MongoDB connection string is correct
   - Check that your IP address is whitelisted in MongoDB Atlas

4. **Image Upload Issues**
   - Verify your Cloudinary credentials are correct
   - Check that the Cloudinary configuration is properly set up

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend can connect to the backend
- [ ] User registration and login work correctly
- [ ] Google OAuth login works correctly
- [ ] Image uploads work correctly
- [ ] All pages load and function as expected
- [ ] Responsive design works on mobile devices

For any additional help or questions, please contact the development team.
