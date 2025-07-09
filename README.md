# PeerLink - End to End & Simple File Sharing

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://peer-link-beta.vercel.app/) <!-- Replace with your live Vercel link -->
[![Backend Status](https://img.shields.io/badge/Backend-Live-blue?style=for-the-badge&logo=render)](https://peer-link-beta.vercel.app/) <!-- Replace with your live Render link -->

PeerLink is a web application designed for fast, simple, and secure P2P-inspired file sharing. It allows a user to upload a file and receive a temporary "invite code". Anyone with this code can download the file directly.

The key feature of PeerLink is that **files are never permanently stored on the server's disk**. The file is held in memory for the duration of the sharing session and streamed directly to receivers, ensuring privacy and efficiency.

## 📸 Screenshots

<p align="center">
  <strong>Sharing a File</strong><br>
  <img src="https://github.com/NISHANT-RATHORE/PeerLink/blob/main/.github/assets/Screenshot%202025-07-09%20210646.png?raw=true" alt="Sharing a file and getting an invite code" width="700">
</p>
<p align="center">
  <strong>Receiving a File</strong><br>
  <img src="https://github.com/NISHANT-RATHORE/PeerLink/blob/main/.github/assets/Screenshot%202025-07-09%20210719.png?raw=true" alt="Receiving a file with an invite code" width="700">
</p>

## ✨ Features

-   **Simple Interface:** Clean, intuitive UI built with React and Tailwind CSS.
-   **Secure by Design:** Files are not saved to the server's filesystem. The sharing session is temporary.
-   **Invite Code System:** Share files easily using a simple, auto-generated code.
-   **Concurrent Downloads:** Multiple users can download the same file simultaneously from a single share session.
-   **Drag & Drop:** Modern and convenient file selection.
-   **Session-Based:** The share link is only valid as long as the file sharing session is active on the server.

## ⚙️ How It Works - Architecture Deep Dive

PeerLink uses a client-server architecture, but with a clever backend design to facilitate direct, concurrent file streams.

### High-Level Flow

1.  **Share (Uploader):**
    -   A user (User 1) selects a file in the UI.
    -   The frontend sends the file to the backend `/upload` endpoint.
    -   The server processes the file, starts a sharing session, and returns a unique **Invite Code** (e.g., `41896`).

2.  **Receive (Downloader):**
    -   Another user (User 2) receives the Invite Code.
    -   They enter the code in the "Receive a File" tab.
    -   The UI makes a request to the server, which validates the code and initiates the file download stream.

### Backend Architecture

The Spring Boot backend is the core of the operation. It's designed to handle multiple file sharing sessions and concurrent downloads efficiently.

 <!-- Using one of your provided diagrams -->

1.  **`FileController` (The Entrypoint):**
    -   This controller handles all incoming HTTP requests.
    -   **`UploadHandler`**: Manages `POST` requests to `/upload`. It uses a `MultipartParser` to extract the file from the request. Instead of saving it, it passes the file data to the `FileSharer` component.
    -   **`DownloadHandler`**: Manages requests for downloading files. It takes an Invite Code, looks up the corresponding session, and directs the client to the correct socket for the download.

2.  **`FileSharer` (The Magic):**
    -   This is the heart of the file-sharing logic. When a new file is uploaded:
    -   The `FileSharer` finds an available network port on the server.
    -   It stores a mapping between the newly generated **Invite Code** and this **port**.
    -   It starts a `ServerSocket` on this port, which listens for incoming client connections. This `ServerSocket` is associated with the uploaded file's data (held in memory).

3.  **Concurrency & Multi-threading:**
    -   When a downloader provides a valid Invite Code, they are ready to connect.
    -   The `ServerSocket` (managed by `FileSharer`) accepts the incoming connection from the downloader's client.
    -   **Crucially, it immediately spawns a new worker thread for that specific connection.**
    -   This dedicated thread is responsible for streaming the file's byte data directly to that one client.
    -   Because each connecting client gets its own thread, multiple users can download the file from the same port **concurrently** without blocking each other.

This multi-threaded socket server approach allows PeerLink to serve a single file to many users at once, directly from server memory, making it fast and efficient.

## 🛠️ Tech Stack

| Category    | Technology                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**  | [React.js](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)                                   |
| **Backend**   | [Spring Boot](https://spring.io/projects/spring-boot), [Java](https://www.java.com/), [Maven](https://maven.apache.org/) |
| **Deployment**| [Vercel](https://vercel.com/) (Frontend), [Render](https://render.com/) (Backend)                         |

## 🚀 Getting Started Locally

To run this project on your local machine, follow these steps.

### Prerequisites

-   Node.js & npm
-   Java 17+
-   Maven

### Backend Setup (Spring Boot)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/peerlink.git
cd peerlink/backend

# 2. Build the project
mvn clean install

# 3. Run the application
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`.

### Frontend Setup (React)

```bash
# In a new terminal, navigate to the frontend directory
cd peerlink/frontend

# 1. Install dependencies
npm install

# 2. Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`. Make sure the frontend code is pointing to your local backend API URL (`http://localhost:8080`).

## ☁️ Deployment

-   The **React frontend** is deployed on **Vercel**, which provides a seamless CI/CD pipeline for static sites and React apps.
-   The **Spring Boot backend** is deployed on **Render** as a web service. Render is a great platform for deploying stateful services, servers, and databases.

---

Developed with ❤️ by **Nishant Rathore**.
