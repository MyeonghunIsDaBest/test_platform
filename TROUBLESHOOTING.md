# 🔧 Troubleshooting Guide - Yoru's Random Test Platform

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Cannot find module 'tsconfig-paths/register'"**

**Solution:**
```bash
cd backend
npm install tsconfig-paths --save-dev
```

### **Issue 2: "'vite' is not recognized as an internal or external command"**

**Solution:**
```bash
cd frontend
npm install vite @vitejs/plugin-react typescript --save-dev
```

### **Issue 3: "Cannot run npm" or PowerShell execution policy error**

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Issue 4: Database connection error**

**Solution:**
1. Make sure XAMPP MySQL is running
2. Create database in phpMyAdmin:
   - Go to http://localhost/phpmyadmin
   - Click "New"
   - Database name: `yoru_test_platform_db`
   - Click "Create"

### **Issue 5: Backend server won't start**

**Solution:**
```bash
cd backend

# 1. Generate Prisma client
npx prisma generate

# 2. Push database schema
npx prisma db push

# 3. Seed database
npm run db:seed

# 4. Start server
npm run dev
```

### **Issue 6: Frontend won't start**

**Solution:**
```bash
cd frontend

# 1. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Start development server
npm run dev
```

## 🎯 **Quick Start Commands**

### **Manual Setup:**

1. **Create Database:**
   - Open http://localhost/phpmyadmin
   - Create database: `yoru_test_platform_db`

2. **Backend Setup:**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

3. **Frontend Setup (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

### **Automated Setup:**
```bash
# Run the setup script
start-dev.bat
```

## 🧪 **Testing the Setup**

### **Test Backend:**
Open browser: http://localhost:3001/api/health

Should show:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Yoru's Random Test Platform Backend API"
}
```

### **Test Frontend:**
Open browser: http://localhost:3000

Should show the Yoru's Random Test Platform homepage.

### **Test Database:**
```bash
cd backend
npx prisma studio
```
Opens database GUI at http://localhost:5555

## 🔑 **Default Login Accounts**

After seeding the database:

- **Admin:** admin@yoru-test-platform.com / admin123456
- **Customer:** john.doe@example.com / customer123
- **Professional:** sarah.johnson@example.com / professional123

## 🐛 **Advanced Troubleshooting**

### **Port Already in Use:**
```bash
# Kill processes on ports
npx kill-port 3001
npx kill-port 3000
npx kill-port 5555
```

### **Database Reset:**
```bash
cd backend
npx prisma db push --force-reset
npm run db:seed
```

### **Complete Reset:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npx prisma db push --force-reset
npm run db:seed

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### **Check XAMPP Services:**
1. Open XAMPP Control Panel
2. Make sure Apache and MySQL are "Running"
3. If not, click "Start" for each service

### **Verify Node.js Version:**
```bash
node --version
# Should be v18 or higher
```

### **Check npm Configuration:**
```bash
npm config list
# Verify registry and other settings
```

## 📞 **Still Having Issues?**

### **Check These:**
1. ✅ XAMPP MySQL is running
2. ✅ Database `yoru_test_platform_db` exists
3. ✅ Node.js v18+ is installed
4. ✅ PowerShell execution policy is set
5. ✅ All npm dependencies are installed
6. ✅ Ports 3000, 3001, 5555 are available

### **Log Files to Check:**
- Backend console output
- Browser developer console (F12)
- XAMPP MySQL error logs

### **Common Error Messages:**

**"EADDRINUSE"** = Port already in use
**"ECONNREFUSED"** = Database not running
**"MODULE_NOT_FOUND"** = Missing npm package
**"Permission denied"** = PowerShell execution policy

---

## 🎉 **Success Indicators**

When everything is working correctly:

✅ Backend console shows: "🚀 Yoru's Random Test Platform Backend Server running on port 3001"
✅ Frontend console shows: "Local: http://localhost:3000/"
✅ http://localhost:3001/api/health returns JSON response
✅ http://localhost:3000 shows the homepage
✅ Database has tables visible in Prisma Studio

**You're ready to develop! 🚀**
