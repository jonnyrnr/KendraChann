# The Enigma Channel - Project README

## 1. Project Overview

Welcome to The Enigma Channel's official website. This is a bespoke web application designed to serve two primary functions:

1.  **A Public-Facing Portal:** Acts as a digital storefront for Kendra Collier's psychic services, offering information on readings, art commissions, and a unique AI-powered psychic advisor.
2.  **A Private Creator Toolkit:** An exclusive, admin-only dashboard equipped with powerful AI tools to assist in the creation, planning, and strategy of spiritual and mystical content for platforms like YouTube.

The application is built to be a seamless, mystical, and modern experience, blending ancient wisdom with cutting-edge technology.

---

## 2. Technology Stack

This project is built as a modern, serverless frontend application that runs directly in the browser.

-   **Frontend Framework:** **React 19** for building the user interface.
-   **Language:** **TypeScript** for type safety and improved code quality.
-   **AI Integration:** **Google Gemini API** (`@google/genai`) is the core AI engine powering the psychic advisor and the entire Creator Toolkit.
-   **Styling:** **Tailwind CSS** for a utility-first styling approach, enabling rapid and consistent design.
-   **Animations:** **Framer Motion** for fluid, beautiful animations and page transitions that enhance the user experience.
-   **Environment:** The app runs without a traditional build step. It uses an **`importmap`** to load dependencies like React and the Gemini SDK directly from a CDN, which is ideal for rapid prototyping and development.

---

## 3. Core Features & How to Test

To fully test the application, you will need to use the admin credentials to access the Creator Toolkit.

**Admin Credentials:**
-   **Email:** `admin@enigma.com`
-   **Password:** `admin123`

### 3.1. Public Services Page

This is the landing page for all visitors.

-   **AI Psychic Advisor:**
    -   **Functionality:** Users can type a question into the input field and press "Consult".
    -   **Testing:** Ask a simple question like "What energy should I focus on this week?". Observe the response streaming in word-by-word, simulating a "channeled" message from the AI.
-   **Services & Offerings:** These are static content cards. The "Creator Toolkit Access" card will prompt a login modal if you are not logged in.
-   **Audio Player:** The music icon in the header toggles ambient background music for the site.

### 3.2. Authentication

-   **Functionality:** A login/signup modal handles user access. For this prototype, user data (for non-admin users) is stored in the browser's `localStorage`. The current logged-in session is managed by `sessionStorage`.
-   **Testing:**
    1.  Click the "Login / Sign Up" button.
    2.  Try creating a new account.
    3.  Log out, then log back in with the account you just created.
    4.  Finally, log in with the **admin credentials** provided above to access the toolkit.

### 3.3. Creator Toolkit (Admin Only)

This is the heart of the creator-focused features. It's divided into two main sections:

#### A. Blueprint Generator

-   **Functionality:** Generates a complete business and content plan for a YouTube channel based on a user's description.
-   **Testing:**
    1.  In the textarea, describe a channel idea. (e.g., "A channel that combines tarot reading with modern witchcraft tutorials for beginners").
    2.  Click "Generate YouTube Blueprint". You will see a loading state while the Gemini API processes the request.
    3.  Review the generated plan, which is broken down into collapsible sections (Branding, Content Strategy, etc.).
    4.  **Interactive Video Ideas:** In the "Video Ideas" section, click on any of the generated ideas. This triggers a *second* API call to get more detailed information, including a script outline, visual suggestions, and specific SEO keywords and tags.
    5.  **History:** Click the "Save Blueprint" button. Then, click the "History" button in the header. You should see your saved plan. You can load it back into view or delete it. This data is saved in `localStorage`.
    6.  **Feedback:** At the bottom, rate the plan using the star system and submit. This simulates collecting user feedback and is also stored locally.

#### B. Live Streaming Hub

-   **Functionality:** A utility dashboard to help manage live streaming sessions. **Note: This tool does not start a stream itself.** It's a "command center" to store and copy credentials for use in broadcasting software like OBS or Streamlabs.
-   **Testing:**
    1.  Enter a sample RTMP URL (e.g., `rtmp://live.twitch.tv/app`) and a sample Stream Key (e.g., `live_12345_abcdefg`).
    2.  This information will be saved to `localStorage` so it persists when you return.
    3.  Use the "SHOW"/"HIDE" button to toggle the visibility of the stream key.
    4.  Use the copy icons to copy the URL, key, title, and description to your clipboard.
    5.  Select the platforms you intend to stream to; this is just a visual checklist.

---

## 4. Future Implementation & Roadmap (TODO)

This application is a powerful prototype. To evolve it into a production-ready, scalable platform, the following steps are recommended.

### 4.1. Backend & Database Implementation

The highest priority is to move from a browser-storage-based system to a secure backend.

-   **[ ] Create a Node.js (or Python/Go) backend server.**
-   **[ ] Implement a database (e.g., PostgreSQL, MongoDB) to store:**
    -   User accounts (with hashed passwords).
    -   Saved YouTube plans tied to user accounts.
    -   Plan feedback and ratings.
-   **[ ] Develop a secure REST API for:**
    -   User authentication (register, login) using JSON Web Tokens (JWT).
    -   CRUD (Create, Read, Update, Delete) operations for saved plans.
-   **[ ] Create a Gemini API Proxy:** The backend should handle all calls to the Gemini API. This is **critical for security**, as it hides the API key from the frontend and prevents unauthorized use.

### 4.2. Enhanced AI & Core Features

-   **[ ] Implement "Future Visions" Tools:** Build out the UI and API calls for the "AI Dream Interpreter," "AI Sigil Generator," and "AI Astrological Narrator."
-   **[ ] Fine-Tune Models:** For a truly unique experience, explore fine-tuning a Gemini model on Kendra's past readings, writings, or art descriptions to create an AI that more closely mirrors her specific style and voice.
-   **[ ] Streaming Hub Improvements:** Integrate with APIs from Twitch or YouTube to fetch real-time stream status (viewers, uptime) and update the "OFFLINE" indicator automatically.

### 4.3. User Experience & Monetization

-   **[ ] E-commerce Integration:** Integrate with **Stripe** or **Shopify's API** to allow clients to directly purchase readings or art commissions.
-   **[ ] Booking System:** Embed or integrate a service like **Calendly** to allow clients to book and pay for time slots for virtual or in-person readings.
-   **[ ] Dedicated User Dashboards:** Allow regular (non-admin) users to have a simple dashboard where they can view their purchase history and booking schedule.

### 4.4. Deployment & Build Process

-   **[ ] Introduce a Build Tool:** Use a modern tool like **Vite** or **Next.js**. This will optimize the code (bundling, minification), improve performance, and provide a better development experience.
-   **[ ] Set up Hosting:**
    -   **Frontend:** Deploy to a platform like **Vercel** or **Netlify**.
    -   **Backend:** Deploy the server and database to a service like **Render**, **Railway**, or a cloud provider (GCP, AWS).