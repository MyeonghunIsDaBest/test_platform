# 🚀 Deployment Guide - Yoru's Random Test Platform

## 📋 Pre-Deployment Checklist

### **✅ Backend Verification**
- [ ] All dependencies installed (`npm install` in backend/)
- [ ] Environment variables configured (.env file)
- [ ] Database connection tested
- [ ] Prisma migrations applied
- [ ] Seed data loaded (optional)
- [ ] Tests passing (`npm test`)

### **✅ Frontend Verification**
- [ ] All dependencies installed (`npm install` in frontend/)
- [ ] Environment variables configured (.env file)
- [ ] API endpoints configured correctly
- [ ] Build process working (`npm run build`)
- [ ] Static assets optimized

### **✅ Security Checklist**
- [ ] JWT secrets are strong and unique
- [ ] Database credentials are secure
- [ ] Stripe keys are production keys (not test)
- [ ] CORS origins are properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive

## 🌐 Production Deployment Options

### **Option 1: Heroku Deployment (Recommended for beginners)**

#### Backend Deployment:
```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create yoru-test-platform-api

# 4. Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set JWT_REFRESH_SECRET=your-super-secret-refresh-key
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
heroku config:set SENDGRID_API_KEY=your-sendgrid-key
heroku config:set STRIPE_SECRET_KEY=your-stripe-secret-key

# 6. Deploy
git subtree push --prefix=backend heroku main

# 7. Run migrations
heroku run npm run db:migrate
heroku run npm run db:seed
```

#### Frontend Deployment:
```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Deploy to Netlify/Vercel
# - Upload dist/ folder to Netlify
# - Or connect GitHub repo to Vercel
# - Set environment variables in hosting platform
```

### **Option 2: DigitalOcean/AWS Deployment**

#### Backend (Ubuntu Server):
```bash
# 1. Set up server
sudo apt update
sudo apt install nodejs npm postgresql nginx

# 2. Clone repository
git clone https://github.com/MyeonghunIsDaBest/test_platform.git
cd test_platform/backend

# 3. Install dependencies
npm install
npm run build

# 4. Set up PostgreSQL
sudo -u postgres createdb yoru_test_platform_db
sudo -u postgres createuser --interactive

# 5. Configure environment
cp .env.example .env
# Edit .env with production values

# 6. Run migrations
npm run db:migrate
npm run db:seed

# 7. Set up PM2 for process management
npm install -g pm2
pm2 start dist/server.js --name "yoru-api"
pm2 startup
pm2 save

# 8. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/yoru-api
# Add Nginx configuration
sudo ln -s /etc/nginx/sites-available/yoru-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Frontend (Static Hosting):
```bash
# 1. Build for production
npm run build

# 2. Upload to S3/CloudFront or serve via Nginx
# For Nginx:
sudo cp -r dist/* /var/www/html/
```

### **Option 3: Docker Deployment**

#### Create Dockerfile for Backend:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### Create docker-compose.yml:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/yoru_db
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: yoru_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"

volumes:
  postgres_data:
```

## 🔧 Environment Configuration

### **Backend Production .env:**
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/yoru_test_platform_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://your-frontend-domain.com"

# Email Configuration (SendGrid)
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
FROM_EMAIL="noreply@your-domain.com"

# Payment Configuration (Stripe)
STRIPE_SECRET_KEY="sk_live_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable-key"

# File Upload
UPLOAD_PATH="uploads"
MAX_FILE_SIZE="10485760"

# Security
CORS_ORIGIN="https://your-frontend-domain.com"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```

### **Frontend Production .env:**
```env
# API Configuration
VITE_API_URL="https://your-backend-domain.com/api"
VITE_SOCKET_URL="https://your-backend-domain.com"

# App Configuration
VITE_APP_NAME="Yoru's Random Test Platform"
VITE_APP_VERSION="1.0.0"

# Payment Configuration
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable-key"

# Features
VITE_ENABLE_ANALYTICS="true"
VITE_ENABLE_CHAT="true"
```

## 🔒 Security Hardening

### **Backend Security:**
```bash
# 1. Install security packages
npm install helmet express-rate-limit express-mongo-sanitize

# 2. Enable HTTPS (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-api-domain.com

# 3. Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 4. Set up log monitoring
sudo apt install fail2ban
```

### **Database Security:**
```sql
-- Create dedicated database user
CREATE USER yoru_app WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE yoru_test_platform_db TO yoru_app;
GRANT USAGE ON SCHEMA public TO yoru_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yoru_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO yoru_app;
```

## 📊 Monitoring & Maintenance

### **Health Checks:**
```bash
# Backend health check
curl https://your-api-domain.com/api/health

# Database connection check
npm run db:status

# Check logs
pm2 logs yoru-api
```

### **Backup Strategy:**
```bash
# Database backup
pg_dump yoru_test_platform_db > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump yoru_test_platform_db | gzip > /backups/yoru_backup_$DATE.sql.gz
find /backups -name "yoru_backup_*.sql.gz" -mtime +7 -delete
```

## 🚀 Go Live Checklist

### **Final Steps:**
- [ ] Domain names configured and DNS propagated
- [ ] SSL certificates installed and working
- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Seed data loaded (if needed)
- [ ] Payment gateway tested with real transactions
- [ ] Email delivery tested
- [ ] All user flows tested end-to-end
- [ ] Performance testing completed
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

### **Post-Launch:**
- [ ] Monitor error logs for first 24 hours
- [ ] Test all critical user journeys
- [ ] Monitor database performance
- [ ] Check payment processing
- [ ] Verify email notifications
- [ ] Monitor server resources

## 📞 Support & Troubleshooting

### **Common Issues:**
1. **Database Connection Errors**: Check DATABASE_URL and network connectivity
2. **JWT Token Issues**: Verify JWT_SECRET is set and consistent
3. **CORS Errors**: Check FRONTEND_URL and CORS_ORIGIN settings
4. **Payment Failures**: Verify Stripe keys and webhook endpoints
5. **Email Not Sending**: Check SendGrid API key and FROM_EMAIL

### **Logs Location:**
- **PM2 Logs**: `~/.pm2/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`

### **Emergency Contacts:**
- Database Issues: Check PostgreSQL documentation
- Payment Issues: Contact Stripe support
- Email Issues: Contact SendGrid support
- Server Issues: Check hosting provider status

---

**🎉 Congratulations! Your Yoru's Random Test Platform is now ready for production deployment!**
