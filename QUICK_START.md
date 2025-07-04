# 🚀 Quick Start Guide - Yoru's Random Test Platform

## 🔧 **Option 1: Easy Setup with Docker (Recommended)**

### Prerequisites:
- Node.js 18+ installed
- Docker Desktop installed and running

### Steps:

1. **Start PostgreSQL with Docker:**
```bash
# In the project root directory
docker-compose -f docker-compose.dev.yml up -d
```

2. **Install Backend Dependencies:**
```bash
cd backend
npm install
```

3. **Set up Database:**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed with sample data
npm run db:seed
```

4. **Start Backend Server:**
```bash
npm run dev
```

The backend will be running at `http://localhost:3001`

5. **Install Frontend Dependencies (in a new terminal):**
```bash
cd frontend
npm install
```

6. **Start Frontend Server:**
```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

---

## 🔧 **Option 2: Manual PostgreSQL Setup**

### If you prefer to install PostgreSQL manually:

1. **Install PostgreSQL:**
   - Download from: https://www.postgresql.org/download/
   - Install with default settings
   - Remember the password you set for the `postgres` user

2. **Create Database:**
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE yoru_test_platform_db;
```

3. **Update .env file:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/yoru_test_platform_db"
```

4. **Continue with steps 2-6 from Option 1**

---

## 🔧 **Option 3: Using XAMPP MySQL (Alternative)**

### If you want to use MySQL instead:

1. **Start XAMPP MySQL**

2. **Update Prisma Schema:**
```prisma
// In prisma/schema.prisma, change:
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

3. **Update .env file:**
```env
DATABASE_URL="mysql://root:@localhost:3306/yoru_test_platform_db"
```

4. **Create Database in phpMyAdmin:**
   - Go to http://localhost/phpmyadmin
   - Create database: `yoru_test_platform_db`

5. **Continue with setup steps**

---

## 🧪 **Testing the Setup**

### Test Backend API:
```bash
# Health check
curl http://localhost:3001/api/health

# Should return: {"status":"OK","timestamp":"...","service":"Yoru's Random Test Platform Backend API"}
```

### Test Database Connection:
```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

### Test Frontend:
- Open http://localhost:3000
- You should see the Yoru's Random Test Platform homepage

---

## 🔑 **Default Test Accounts**

After running `npm run db:seed`, you'll have these test accounts:

### Admin Account:
- **Email:** admin@yoru-test-platform.com
- **Password:** admin123456

### Customer Account:
- **Email:** john.doe@example.com
- **Password:** customer123

### Professional Account:
- **Email:** sarah.johnson@example.com
- **Password:** professional123

---

## 🐛 **Troubleshooting**

### PowerShell Execution Policy Error:
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Connection Error:
1. Make sure PostgreSQL/Docker is running
2. Check the DATABASE_URL in .env file
3. Verify database exists

### Port Already in Use:
```bash
# Kill process on port 3001
npx kill-port 3001

# Kill process on port 3000
npx kill-port 3000
```

### Prisma Errors:
```bash
# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Node Modules Issues:
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 **Next Steps**

Once everything is running:

1. **Explore the API:** Check out the API documentation in README.md
2. **Test Features:** Try registering users, creating listings, booking appointments
3. **Admin Dashboard:** Login as admin to see the management interface
4. **Customize:** Modify the code to fit your specific needs

---

## 🆘 **Need Help?**

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Make sure all services are running
4. Check the troubleshooting section above

**Happy coding! 🎉**
