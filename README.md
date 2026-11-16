# 🏋️ Gym Application - Integrated Development Environment

## Overview

This is an integrated development setup that allows you to run both the **Django Backend** and **React Frontend** with a single command. The frontend and backend will automatically start together and communicate seamlessly.

---

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or higher) - [Install](https://nodejs.org/)
- **Python** (v3.12 or higher) - [Install](https://www.python.org/)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

Verify installations:
```bash
node --version
npm --version
python --version
pip --version
```

---

## 🚀 Quick Start (First Time Only)

### Option A: Using Scripts (Recommended)

**Windows (Command Prompt):**
```batch
setup.bat
```

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Mac/Linux:**
```bash
bash setup.sh
```

The setup script will:
1. ✅ Install all npm dependencies (root + frontend)
2. ✅ Create Python virtual environment
3. ✅ Install Python packages from requirements.txt
4. ✅ Run Django migrations
5. ✅ Prepare everything for development

### Option B: Manual Setup

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd gym-frontend
npm install
cd ..

# Install backend dependencies
cd backend
python -m venv venv

# Activate virtual environment
# Windows Command Prompt:
venv\Scripts\activate.bat
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Run migrations
python manage.py migrate
cd ..
```

---

## 🎯 Running the Application

### Option 1: Using npm (Recommended)

From the **root directory** (`Gym-application-badri`):

```bash
npm run dev
```

or

```bash
npm start
```

### Option 2: Using Scripts

**Windows (Command Prompt):**
```batch
start.bat
```

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Mac/Linux:**
```bash
bash start.sh
```

### Option 3: Manual (If you prefer to start servers separately)

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd gym-frontend
npm run dev
```

---

## 📍 Access Points

Once both servers are running:

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:5174 | React UI |
| **Backend** | http://127.0.0.1:8000 | Django Server |
| **API** | http://127.0.0.1:8000/api | REST API |
| **Admin Panel** | http://127.0.0.1:8000/admin | Django Admin |

---

## 📦 Available Commands

From the **root directory**:

```bash
# Run both servers (recommended)
npm run dev
npm start

# Run only frontend
npm run frontend:only

# Run only backend
npm run backend:only

# Build frontend for production
npm run build:frontend

# Lint frontend code
npm run lint:frontend

# Install all dependencies (if setup was incomplete)
npm run install:all
```

---

## 🔧 Configuration

### Backend Configuration

The backend uses a `.env` file for configuration. Default `.env` is already created at:
```
backend/.env
```

Key settings:
- `SECRET_KEY` - Django secret key (already set for development)
- `DEBUG` - Set to True for development
- `COHERE_API_KEY` - For AI features (leave empty if not using)
- `CLOUD_NAME`, `API_KEY`, `API_SECRET` - For Cloudinary (leave empty if not using)

### Frontend Configuration

The frontend axios API base URL is configured at:
```
gym-frontend/src/componenets/utils/axiosInstance.js
```

Already set to: `http://localhost:8000/api`

---

## 🔌 Backend-Frontend Connection

### How It Works

1. **Frontend** runs on `http://localhost:5174`
2. **Backend** runs on `http://127.0.0.1:8000`
3. **Frontend makes API calls** to `http://127.0.0.1:8000/api/*`
4. **CORS is enabled** in Django settings to accept requests from the frontend
5. **JWT Authentication** is used for user sessions

### Automatic Concurrency

The `npm run dev` command uses **concurrently** to:
- Start Django backend on port 8000
- Start Vite frontend on port 5174
- Kill both if either one fails
- Restart both when code changes (in development mode)

---

## 🛑 Stopping the Application

**If running with npm/scripts:**
```
Press Ctrl+C
```

This will stop both servers gracefully.

**If running servers separately:**
- Frontend: Press Ctrl+C in frontend terminal
- Backend: Press Ctrl+C in backend terminal

---

## 🐛 Troubleshooting

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "python: command not found"
**Solution:** Install Python from https://www.python.org/

### Issue: Frontend can't reach backend
**Solution:** 
1. Verify backend is running on http://127.0.0.1:8000
2. Check browser console (F12) for CORS errors
3. Ensure `.env` file exists in backend directory

### Issue: Port 5174 is already in use
**Solution:**
1. Vite will automatically try the next port (5175, 5176, etc.)
2. Or kill the process using that port:
   ```bash
   # Windows
   netstat -ano | findstr :5174
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5174 | xargs kill -9
   ```

### Issue: Port 8000 is already in use
**Solution:**
```bash
cd backend
python manage.py runserver 8001  # Use different port
```

### Issue: "ModuleNotFoundError" when running backend
**Solution:**
1. Activate virtual environment (if not already active)
2. Reinstall packages: `pip install -r requirements.txt`

### Issue: Django migration errors
**Solution:**
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## 📱 Features

✅ Automatic frontend + backend startup  
✅ Hot reload for development  
✅ JWT authentication  
✅ CORS enabled for frontend-backend communication  
✅ Python virtual environment  
✅ Easy one-command deployment  

---

## 🎓 Project Structure

```
Gym-application-badri/
├── backend/                 # Django REST API
│   ├── api/                # Main API app
│   ├── backend/            # Django settings
│   ├── manage.py
│   ├── requirements.txt     # Python dependencies
│   ├── db.sqlite3          # Database
│   └── .env                # Environment variables
│
├── gym-frontend/           # React + Vite app
│   ├── src/                # React components
│   ├── public/             # Static files
│   ├── package.json
│   └── vite.config.js
│
├── package.json            # Root npm config
├── start.bat               # Windows startup script
├── start.ps1               # PowerShell startup script
├── start.sh                # Unix/Mac startup script
├── setup.bat               # Windows setup script
├── setup.ps1               # PowerShell setup script
├── setup.sh                # Unix/Mac setup script
└── README.md              # This file
```

---

## 🔐 Security Notes

⚠️ **Development Only Configuration**  
- DEBUG mode is enabled
- SECRET_KEY is a development key
- CORS allows localhost

**For Production:**
- Set DEBUG = False
- Use a strong SECRET_KEY
- Configure CORS properly
- Use environment-specific settings
- Set up HTTPS/SSL

---

## 📝 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [REST Framework](https://www.django-rest-framework.org/)
- [Vite Documentation](https://vitejs.dev/)

---

## 💡 Tips

1. **Keep terminal open** while developing
2. **Check console errors** (F12 in browser)
3. **Hot reload works** for both frontend and backend
4. **Save files** to trigger automatic reloads
5. **Use separate terminals** if you prefer independent control

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check that both servers show "running" status
4. Look for errors in terminal output

---

**Happy Coding! 🚀**

Last Updated: April 24, 2026
