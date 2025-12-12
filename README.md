# Online-Compiler
![image](https://github.com/user-attachments/assets/cac43e35-e0e2-4c3f-93c1-d07279f76035)
# Online Compiler

Welcome to the **Online Compiler** project! This web application allows users to compile and run C++ and Python code directly from their browser. It's built with a Node.js backend and a React frontend, utilizing Redis for efficient caching and processing.

## Features

- Compile and run C++ and Python code.
- User-friendly interface with real-time output.
- Fast execution using Redis for caching.

## Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** Redis
- **Languages Supported:** C++, Python

## Installation

To get started with the Online Compiler, you'll need to install the necessary dependencies.

1. Clone the repository:

   ```bash
   git clone https://github.com/siddhanth4/Online_Compiler.git
2. Navigate to the project directory:

   ```bash
   cd Online_Compiler
3. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
4. Install dependencies for the client:
   ```bash
   cd ../client
   npm install
##Usage

Starting the Application

1. Start the Backend:
   ```bash
   cd backend
   npm run start
2. Start the Client:
   ```bash
   cd client
   npm start
3. Start the Redis:
   ```bash
   redis-server
   redis-cli
