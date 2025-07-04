# 🚀 XAMPP Setup Guide - Yoru's Random Test Platform

## 📋 **Prerequisites**
- XAMPP installed and running
- Node.js 18+ installed

## 🔧 **Step-by-Step Setup**

### **Step 1: Start XAMPP Services**
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Make sure both show "Running" status

### **Step 2: Create Database**
1. Open your browser and go to: http://localhost/phpmyadmin
2. Click "New" on the left sidebar
3. Database name: `yoru_test_platform_db`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**OR** run the SQL script:
```sql
CREATE DATABASE IF NOT EXISTS yoru_test_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### **Step 3: Install Backend Dependencies**
Open Command Prompt or PowerShell in the project directory:

```bash
cd backend
npm install
```

### **Step 4: Set up Database Schema**
```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with sample data
npm run db:seed
```

### **Step 5: Start Backend Server**
```bash
npm run dev
```

You should see:
```
🚀 Yoru's Random Test Platform Backend Server running on port 3001
📊 Environment: development
🌐 CORS enabled for: http://localhost:3000
✅ Database connected successfully
```

### **Step 6: Install Frontend Dependencies**
Open a new terminal:

```bash
cd frontend
npm install
```

### **Step 7: Start Frontend Server**
```bash
npm run dev
```

You should see:
```
Local:   http://localhost:3000/
Network: use --host to expose
```

## 🧪 **Test the Setup**

### **Test Backend API:**
Open your browser and go to: http://localhost:3001/api/health

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Yoru's Random Test Platform Backend API"
}
```

### **Test Frontend:**
Open your browser and go to: http://localhost:3000

You should see the Yoru's Random Test Platform homepage.

### **Test Database:**
```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

This will open http://localhost:5555 with a database management interface.

## 🔑 **Default Test Accounts**

After seeding, you can login with:

### **Admin Account:**
- Email: `admin@yoru-test-platform.com`
- Password: `admin123456`

### **Customer Account:**
- Email: `john.doe@example.com`
- Password: `customer123`

### **Professional Account:**
- Email: `sarah.johnson@example.com`
- Password: `professional123`

## 🐛 **Troubleshooting**

### **"Cannot run npm" Error:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Database Connection Error:**
1. Make sure XAMPP MySQL is running
2. Check if database `yoru_test_platform_db` exists in phpMyAdmin
3. Verify the DATABASE_URL in `.env` file

### **Port Already in Use:**
```bash
# Kill process on port 3001
npx kill-port 3001

# Kill process on port 3000  
npx kill-port 3000
```

### **Prisma Errors:**
```bash
# Reset and recreate database
npx prisma db push --force-reset

# Regenerate client
npx prisma generate

# Seed again
npm run db:seed
```

### **Module Not Found Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🎉 **Success!**

If everything is working:
- Backend API: http://localhost:3001
- Frontend App: http://localhost:3000
- Database GUI: http://localhost:5555 (when running `npx prisma studio`)
- phpMyAdmin: http://localhost/phpmyadmin

You're ready to start developing! 🚀
