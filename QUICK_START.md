# Quick Start Guide

## 🚀 Fast Setup (Windows)

### 1. Install Prerequisites
- Python 3.8+ ([Download](https://www.python.org/downloads/))
- Node.js 16+ ([Download](https://nodejs.org/))
- MongoDB ([Download](https://www.mongodb.com/try/download/community))

### 2. Start MongoDB
- Open Services (Win + R → `services.msc`)
- Find "MongoDB" and click "Start"
- OR run: `mongod` in terminal

### 3. Backend Setup (Terminal 1)
```powershell
cd backend
pip install -r requirements.txt
python model_train.py
python app.py
```
✅ Backend running on http://localhost:5000

### 4. Frontend Setup (Terminal 2)
```powershell
cd frontend
npm install
npm start
```
✅ Frontend running on http://localhost:3000

### 5. Login
- Open http://localhost:3000
- Enter any email/password (auto-creates user)
- Start using the system!

## 📋 Checklist

- [ ] MongoDB is running
- [ ] Backend dependencies installed
- [ ] Model trained (fertilizer_model.pkl exists)
- [ ] Backend server running (port 5000)
- [ ] Frontend dependencies installed
- [ ] Frontend server running (port 3000)

## 🎯 First Steps After Login

1. Go to **Fertilizer Planner**
2. Fill in soil parameters
3. Select crop type
4. Get recommendation
5. Download PDF report

## 🔧 Troubleshooting

**Backend won't start?**
- Check MongoDB is running
- Ensure port 5000 is free
- Run `python model_train.py` first

**Frontend won't start?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (16+)

**Model not found?**
- Run `python model_train.py` in backend folder
- Check for `.pkl` files in backend directory

---

For detailed instructions, see [README.md](README.md)

