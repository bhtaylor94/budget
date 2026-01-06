# Budget Pro - Personal Budget App

A beautiful, full-featured budget app with AI coaching, charts, bill reminders, and savings goals.

## 🚀 Quick Deploy to Vercel (Recommended - 5 minutes)

### Step 1: Get the code on GitHub
1. Create a GitHub account if you don't have one: https://github.com
2. Click "New repository" → name it `budget-app` → Create
3. Upload all files from this zip to the repository

### Step 2: Deploy to Vercel (Free)
1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New Project"
3. Import your `budget-app` repository
4. Click "Deploy" - that's it!
5. You'll get a URL like `budget-app-yourname.vercel.app`

### Step 3: Add to Home Screen (Make it feel like an app)

**iPhone/iPad:**
1. Open your Vercel URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Budget" and tap Add

**Android:**
1. Open your Vercel URL in Chrome
2. Tap the three dots menu (⋮)
3. Tap "Add to Home screen"
4. Name it "Budget" and tap Add

Now you have a home screen icon that opens full-screen like a native app!

---

## 🔄 Cross-Device Sync with Firebase (Optional - 15 minutes)

To sync your budget across phone, tablet, and computer:

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project" → name it "my-budget"
3. Disable Google Analytics (not needed) → Create

### Step 2: Set up Realtime Database
1. In Firebase console, click "Build" → "Realtime Database"
2. Click "Create Database"
3. Select your region → "Start in test mode" → Enable

### Step 3: Get your config
1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" → Click web icon `</>`
3. Name it "budget-web" → Register app
4. Copy the `firebaseConfig` object

### Step 4: Add to your app
1. Open `src/App.jsx`
2. Find the storage helper at the top and replace with:

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
  // PASTE YOUR CONFIG HERE
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const userId = localStorage.getItem('budget-user-id') || (() => {
  const id = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('budget-user-id', id);
  return id;
})();

const storage = {
  get: async (key) => {
    try {
      const snapshot = await get(ref(db, `users/${userId}/${key}`));
      return snapshot.val();
    } catch { return null; }
  },
  set: async (key, value) => {
    try {
      await set(ref(db, `users/${userId}/${key}`), value);
    } catch (e) { console.error('Sync error:', e); }
  }
};
```

3. Add Firebase to package.json dependencies:
```json
"firebase": "^10.7.0"
```

4. Run `npm install` and redeploy

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

---

## 📱 Features

- ✅ Zero-based budgeting (EveryDollar style)
- ✅ Multi-month navigation
- ✅ Savings goals with progress tracking
- ✅ AI Budget Coach (analyzes your spending)
- ✅ Beautiful charts (pie, bar, area)
- ✅ Bill reminders with due dates
- ✅ Custom reminders
- ✅ Dark mode
- ✅ Works offline (PWA)
- ✅ Mobile-optimized

---

## 🆘 Troubleshooting

**App won't load?**
- Clear browser cache and reload
- Check browser console for errors (F12)

**Data disappeared?**
- Data is stored in browser localStorage
- Different browsers/devices have separate data
- Use Firebase sync to share across devices

**Vercel deploy failed?**
- Make sure all files are uploaded
- Check that package.json is in the root folder

---

Enjoy budgeting! 💰
