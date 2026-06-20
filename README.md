# Crafted Fitness Hub — Partner Ledger App

A React Native mobile application built with **Expo** for gym owners and partners to track member payments, log transactions (Cash, GPay, Card, PhonePe, Paytm), and view live revenue analytics.

---

## Prerequisites

Before running the app, make sure you have the following installed:

| Tool | Download |
|------|----------|
| **Node.js** (v18 or higher) | https://nodejs.org |
| **Expo Go** (on your phone) | [App Store](https://apps.apple.com/app/expo-go/id982107779) · [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| **Android Studio** (optional, for emulator) | https://developer.android.com/studio |
| **Xcode** (optional, iOS only — Mac only) | Mac App Store |

---

## Setup

**Step 1** — Open your terminal and navigate into the app folder:
```bash
cd /Users/meetparmar/Desktop/crafted-Gym/Crafted-Portfolio-App
```

**Step 2** — Install dependencies (only needed once):
```bash
npm install
```

---

## Running the App

### Option 1 — On Your Physical Phone (Recommended)
```bash
npx expo start
```
1. A **QR code** will appear in your terminal.
2. Open the **Expo Go** app on your phone.
3. Tap **"Scan QR Code"** and scan the terminal QR code.
4. The app loads instantly over your Wi-Fi connection! ✅

> ⚠️ Your phone and computer must be on the **same Wi-Fi network**.

---

### Option 2 — In a Web Browser (Easiest, No Phone Needed)
```bash
npx expo start --web
```
Then open **http://localhost:8081** in your browser.

---

### Option 3 — Android Emulator
1. Open **Android Studio** → Launch any virtual device (AVD).
2. Run:
```bash
npx expo start
```
3. Press **`a`** in the terminal to open on the emulator.

---

### Option 4 — iOS Simulator (Mac Only)
```bash
npx expo start
```
Press **`i`** in the terminal to open in the iOS Simulator.

---

## Connecting to a Live Database (Supabase)

By default the app runs with **mock data** (pre-loaded fake members and transactions) so it works with zero setup.

To connect to a real Supabase database:

**Step 1** — Create a free account at https://supabase.com and start a new project.

**Step 2** — Create a `.env` file inside `Crafted-Portfolio-App/`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Step 3** — Run this SQL inside your Supabase SQL Editor to create the tables:
```sql
-- Members table
CREATE TABLE members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'GPay', 'Card', 'PhonePe', 'Paytm', 'Bank Transfer')),
    payment_date DATE DEFAULT CURRENT_DATE,
    period_months INTEGER DEFAULT 1 CHECK (period_months IN (1, 3, 6, 12)),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Step 4** — Restart the Expo server. The status indicator in the app header will switch from `Mock DB` to `Supabase Live`. ✅

---

## App Screens

| Screen | Description |
|--------|-------------|
| **Overview** | Total revenue, this month's income, active members, payment method breakdown |
| **Log Pay** | Log a new payment for a member (Cash, GPay, Card, etc.) |
| **Members** | Browse, search, add members and view individual payment history |
| **History** | Full chronological transaction feed with payment method filters |

---

## Project Structure

```
Crafted-Portfolio-App/
├── App.js                  # Root component, tab navigation
├── lib/
│   └── supabase.js         # Database client + mock fallback data
├── components/
│   ├── Dashboard.js        # Revenue analytics screen
│   ├── AddPayment.js       # Payment logging form
│   ├── Members.js          # Member directory and detail sheets
│   └── History.js          # Transaction log with filters
├── assets/                 # App icons and splash images
├── app.json                # Expo app configuration
└── package.json            # Dependencies
```
