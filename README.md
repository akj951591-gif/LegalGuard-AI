
# LegalGuard AI ⚖️

**Democratizing Justice in India through AI-Driven Legal Awareness.**

LegalGuard AI is a comprehensive legal assistance and strategy platform designed to empower Indian citizens with immediate knowledge of their fundamental rights, legal procedures, and actionable strategies during civil or criminal disputes.

## 🚀 Deployment to Netlify

This project is optimized for **Netlify** using the **Vite** build process.

### Step-by-Step Deployment

1.  **Connect to Git:** Push your code to GitHub, GitLab, or Bitbucket.
2.  **Netlify Import:**
    -   Log in to [Netlify](https://app.netlify.com/).
    -   Click **"Add new site"** > **"Import an existing project"**.
    -   Select your repository.
3.  **Build Settings:**
    -   **Build Command:** `npm run build`
    -   **Publish Directory:** `dist`
4.  **Environment Variables:**
    -   Go to **Site Settings** > **Environment variables**.
    -   Add a new variable:
        -   **Key:** `API_KEY`
        -   **Value:** `[Your Gemini API Key]`
5.  **Deploy:** Netlify will build and deploy your site.

## 🌟 Key Features

### 1. Intelligent Case Analysis
Explain your legal problem via text or voice. Our system, powered by **Gemini 3 Pro**, generates immediate action steps, legal mapping, and evidence checklists.

### 2. Specialized Rights Modules
Detailed, quick-access guides for high-stakes situations like Police Interactions and Property Disputes.

### 3. Real-Time Emergency Assistance
- **Nearby Help:** Uses Google Maps grounding to find the 5 closest police stations.
- **SOS Helplines:** Quick-dial access to emergency services.

## 🛡 Security & Privacy

- **No Backend:** We do not store your case details on a central server.
- **Local History:** Your reports and chat logs are stored exclusively in your browser's `LocalStorage`.

---

**Developed with ❤️ for Public Justice and Legal Literacy.**
