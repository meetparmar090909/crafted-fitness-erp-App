# 🏋️‍♂️ Crafted Fitness Hub — Partner Ledger & Revenue Tracker

A premium, high-performance React Native mobile application built with **Expo** and **Supabase** designed for gym owners and fitness partners to manage member subscriptions, log payments, track revenue splits, and view real-time business statistics.

---

## 📱 Key Features

* **⚡ Real-Time Revenue Dashboard**: Instantly view monthly gross totals, active customer counters, and a sleek payment breakdown (Cash, GPay, Card, PhonePe, Paytm, etc.).
* **📝 Quick Ledger Forms**: Easy-to-use logging form with interactive member search, segmented payment selectors, and duration indicators (1, 3, 6, or 12 months).
* **👥 Member Management Directory**: Register new members, search client databases, and view detailed individual transaction histories in a slide-up sheet.
* **🛡️ Smart Keyboard Handling**: Seamless keyboard dismissal on background tap (`TouchableWithoutFeedback` + `Keyboard.dismiss`) and input safety avoidance (`KeyboardAvoidingView`) across all device forms.
* **🤖 Polish for Android & iOS**: Native-grade layout alignments using `useSafeAreaInsets` to prevent navigation overlaps with Android's system gesture bar or iOS's home indicator.
* **🔌 Offline-First Mock Mode**: Seamlessly operates in mock data fallback mode when database credentials are not detected, allowing immediate review of the UI.

---

## 🛠️ Tech Stack

* **Framework**: React Native (Expo SDK 54)
* **Language**: JavaScript (ES6+)
* **Database**: Supabase (Postgres) / Local In-Memory Fallback
* **Navigation**: Custom Bottom Tab Navigation (polished safe areas)
* **Configuration**: EAS Build (Expo Application Services)

---

## 📂 Project Structure

```text
Crafted-Portfolio-App/
├── App.js                   # Root Component & Tab-based Navigation
├── app.json                 # Expo configurations (package name, orientation, icons)
├── eas.json                 # Expo Application Services build configurations
├── package.json             # App dependencies & run scripts
├── lib/
│   └── supabase.js          # Supabase client initializer & Mock DB engine
└── components/
    ├── Dashboard.js         # Gross revenue statistics & chart breakdown
    ├── AddPayment.js        # Transaction logger & Bottom Sheet member picker
    ├── Members.js           # Directory, Add Member modal & history sheet
    ├── History.js           # Chronological ledger feed with filter tabs
    └── SettingsModal.js     # Dev tools & database status panel
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
* **Node.js** (v18 or higher)
* **Expo Go** app on your physical iOS or Android phone
* *(Optional)* **Android Studio** (for Android Emulator) or **Xcode** (for iOS Simulator, Mac only)

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Crafted-Portfolio-App
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Expo CLI bundler:
```bash
npx expo start
```

* **On Physical Phone (Recommended)**: Scan the QR code displayed in the terminal using your phone's camera (iOS) or the Expo Go app (Android).
* **On Android Emulator**: Press **`a`** in your terminal.
* **On iOS Simulator**: Press **`i`** in your terminal.
* **On Web**: Press **`w`** in your terminal to view the desktop prototype.

> ⚠️ Ensure your phone and development computer are connected to the **same Wi-Fi network**.

---

## ☁️ Supabase Cloud Configuration

To connect this application to your live Supabase cloud database:

1. Create a free account at [Supabase](https://supabase.com) and start a new project.
2. In the root of your `Crafted-Portfolio-App/` folder, create a `.env` file containing your credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Open the **SQL Editor** in your Supabase dashboard and run the following commands to initialize the schema:

```sql
-- Create Gym Members Table
CREATE TABLE public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Payments Ledger Table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'GPay', 'Card', 'PhonePe', 'Paytm', 'Bank Transfer')),
    payment_date DATE DEFAULT CURRENT_DATE,
    period_months INTEGER DEFAULT 1 CHECK (period_months IN (1, 3, 6, 12)),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

4. Restart your Expo development server. The status indicator in the top header will display **`Supabase Live`** (green), indicating it has established a connection to your cloud database!

---

## 📦 Building and Publishing (EAS)

This project is configured with **EAS Build** for creating native standalone binaries (`.apk` for Android and `.ipa` for iOS).

### Prerequisites

1. Install the EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```

### Generating an Android APK (`preview` profile)

We have configured a `preview` profile inside `eas.json` that generates a direct, installable APK file:

```bash
eas build --platform android --profile preview
```

Once the build finishes in the Expo cloud, download the `.apk` file using the generated link or scan the build QR code on your Android device to install!

---

## 🛠️ Key Technical Implementations

### Android System Gestures Alignment
Many Expo apps clip bottom content on Android devices when native swipe gestures are enabled. We solved this in `App.js` by tracking safe area insets:
* The viewport dynamically applies padding at the bottom (`paddingBottom: insets.bottom + 65` or dynamically calculating the height of the tab bar).
* The custom Tab Bar is absolutely positioned above the system navigation line, keeping the app looking polished and accessible on any screen factor.

### Custom Bottom Sheet Selectors
Standard HTML/web absolute-dropdown search boxes clip and behave poorly inside React Native scroll views, particularly on Android. We solved this in `AddPayment.js` by implementing a bottom-sheet selection modal that triggers search inputs and displays member results dynamically in a high-fidelity scrollable listing.
