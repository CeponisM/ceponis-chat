# Ceponis Chat

**Ceponis Chat** is a simple, user-friendly web-based chat application that allows users to sign in and chat with others — including an AI assistant.

## 🚀 Features

- 🔒 Anonymous or email-based sign-in
- 💬 Real-time user-to-user messaging
- 🤖 Built-in AI assistant (OpenAI-powered)
- 🌙 Light & Night Mode toggle
- ✅ Online/offline user indicators
- 📦 Firebase-based backend

## 📷 Preview

![Preview Screenshot](https://your-preview-image-url.com)

## 📦 Tech Stack

- React
- Firebase Auth & Firestore
- Material UI
- OpenAI API (for AI responses)

## 🔧 Setup

1. **Clone the repository**

```bash
git clone https://github.com/CeponisM/ceponis-chat.git
cd ceponis-chat
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env.local` file**

> ⚠️ _Make sure not to expose your Firebase or API keys publicly._

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. **Start the app**

```bash
npm start
```

---

> **Note:** No API keys are included in this repository. Please configure your own securely using environment variables.
