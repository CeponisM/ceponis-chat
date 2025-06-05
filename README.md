# Ceponis Chat

**Ceponis Chat** is a simple, user-friendly web-based chat application that allows users to sign in and chat with others — including an AI assistant.

## 🚀 Features

- 🔒 Anonymous or email-based sign-in
- 💬 Real-time user-to-user messaging
- 🤖 Built-in AI assistant (OpenAI-powered)
- 🌙 Light & Night Mode toggle
- ✅ Online/offline user indicators
- 📦 Firebase-based backend

## 📦 Tech Stack

- React
- Firebase Auth & Firestore
- Material UI
- OpenAI API (for AI responses)

## 🔧 Setup

### 1. **Clone the repository**

```bash
git clone https://github.com/CeponisM/ceponis-chat.git
cd ceponis-chat
```

### 2. **Install dependencies**

```bash
npm install
```

### 3. **Create a `/src/firebase.js` file**

```firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 4. **Deploy Firebase Functions**

This step sets up Firebase Cloud Functions to handle AI responses via the OpenAI API.

### 4.1 Prerequisites

Before proceeding, ensure you have:
- **Node.js and npm**: Install [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- **Firebase CLI**: Install globally with `npm install -g firebase-tools`
- **Firebase Account**: Sign up at [Firebase Console](https://console.firebase.google.com/)
- **OpenAI API Key**: Obtain from the [OpenAI API dashboard](https://platform.openai.com/api-keys)

### 4.2 Install Dependencies

Install the required dependencies for both the root project and functions:

```bash
# Install root project dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

### 4.3 Configure Firebase

1. **Log in to Firebase CLI:**
   ```bash
   firebase login
   ```

2. **Initialize Firebase functions** (if not already done):
   ```bash
   firebase init functions
   ```
   - Select your Firebase project or create a new one
   - Choose JavaScript for the functions language
   - Follow prompts to set up ESLint and install dependencies

### 4.4 Configure OpenAI API Key

**Important**: Store the OpenAI API key securely using Firebase's environment configuration. Never commit API keys to version control.

1. **Set the OpenAI API key:**
   ```bash
   firebase functions:config:set openai.key="sk-your-openai-api-key"
   ```
   Replace `sk-your-openai-api-key` with your actual [OpenAI API key](https://platform.openai.com/api-keys).



2. **Verify the configuration:**
   ```bash
   firebase functions:config:get
   ```
   Expected output:
   ```json
   {
     "openai": {
       "key": "sk-your-openai-api-key"
     }
   }
   ```

### 4.5 Deploy Functions

Deploy the Cloud Functions to Firebase:

```bash
firebase deploy --only functions
```

After deployment, Firebase will provide a URL for the function (e.g., `https://us-central1-chat-#####.cloudfunctions.net/chat`). The chat app uses this endpoint to send messages for AI responses.

Update your .env file with:
```
REACT_APP_CHAT_API_URL=your-api-key
```

### 4.6 Test the Deployment

#### Local Testing (Optional)
Test locally using the Firebase Emulator:

```bash
firebase emulators:start --only functions
```

Send a test POST request:
```bash
curl -X POST http://localhost:5001/chat-#####/us-central1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Function Not Responding:**
Check Firebase logs:
```bash
firebase functions:log
```

**API Key Issues:**
- Verify the key is correctly set: `firebase functions:config:get`
- Ensure the key is valid in the OpenAI dashboard

### 5. **Start the app**

Test the deployed function via the chat app:

1. Run the frontend locally:
   ```bash
   npm start
   ```

2. Open the app, sign in, select the AI agent, and send a message
3. Verify that AI responses are received 
