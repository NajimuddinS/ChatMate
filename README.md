# ChatMate

Welcome to **ChatMate**, a real-time chat application built using the MERN stack, Socket.io, and integrated with the Hugging Face model "mistralai/Mistral-7B-Instruct-v0.2" for AI-driven conversational experiences.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)


## Features

- **Real-Time Communication**: Utilizes Socket.io for instant messaging between users.
- **AI Chat Integration**: Incorporates the "mistralai/Mistral-7B-Instruct-v0.2" model from Hugging Face for AI-assisted conversations.
- **User Authentication**: Secure user registration and login functionality.
- **Responsive Design**: Optimized for various devices, ensuring a seamless user experience across platforms.

## Screenshots

![ChatMate Screenshot 1](https://github.com/NajimuddinS/ChatMate/blob/main/screenshots/screenshot1.png?raw=true)
*Figure 1: Login Page*

![ChatMate Screenshot 2](https://github.com/NajimuddinS/ChatMate/blob/main/screenshots/screenshot2.png?raw=true)
*Figure 2: Home Interface*

![ChatMate Screenshot 3](https://github.com/NajimuddinS/ChatMate/blob/main/Screenshots/ChatUI.png?raw=true)
*Figure 3: Chat Interface*

![ChatMate Screenshot 4](https://github.com/NajimuddinS/ChatMate/blob/main/Screenshots/ChatAI.png?raw=true)
*Figure 4: Chat AI Interface*



## Technologies Used

- **Frontend**:
  - React.js
  - Socket.io-client
  - Tailwind CSS
  - DaisyUI
  - Zustand

- **Backend**:
  - Node.js
  - Express.js
  - Socket.io-server
  - MongoDB
  - JWT

- **AI Integration**:
  - Hugging Face's "mistralai/Mistral-7B-Instruct-v0.2" model

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/NajimuddinS/ChatMate.git
   cd ChatMate
   ```

2. **Backend Setup**:

   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**:

   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Variables**:

   Create a `.env` file in the `Backend` directory and add the following variables:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_cloud_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_cloud_api_secret
   HUGGING_FACE_API_KEY=your_hugging_face_api_key
   ```

5. **Run the Application**:

   - **Backend**:

     ```bash
     cd Backend
     npm run dev
     ```

   - **Frontend**:

     ```bash
     cd ../Frontend
     npm run dev
     ```

   The application should now be running on `http://localhost:3000`.

## Usage

- Register a new account or log in with existing credentials.
- Start a new chat or join existing conversations.
- Experience AI-assisted responses powered by the Mistral-7B-Instruct-v0.2 model.

## Contributing

We welcome contributions to enhance ChatMate. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeatureName`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/YourFeatureName`.
5. Open a pull request.



