# 📺 VideoTube Backend

Backend API for a **video sharing platform** similar to YouTube.
This project handles **videos, tweets (community posts), comments, likes, playlists, user authentication and channel management**.

Built using **Node.js, Express and MongoDB** with scalable REST API architecture.

---

## 🚀 Features

* 🔐 User Authentication (JWT)
* 📹 Video Upload & Management
* 💬 Comments System
* ❤️ Like / Unlike functionality
* 📝 Tweets (Community Posts)
* 📂 Playlist creation and management
* 👤 Channel Profile System
* 📊 Channel Stats (views, subscribers, likes)
* 📡 RESTful API architecture
* 🗂 Modular MVC folder structure

---

## 🛠 Tech Stack

<p align="center">
<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,js,git,github" />
</p>

**Backend Framework**

* Node.js
* Express.js

**Database**

* MongoDB
* Mongoose ODM

**Authentication**

* JWT
* Cookies

**File Handling**

* Cloudinary / Multer

---

## 📂 Project Structure

```
videotube-backend
│
├── src
│   ├── controllers
│   │   ├── video.controller.js
│   │   ├── tweet.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   └── playlist.controller.js
│   │
│   ├── models
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── tweet.model.js
│   │   └── playlist.model.js
│   │
│   ├── routes
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── tweet.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   └── playlist.routes.js
│   │
│   ├── middlewares
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   │
│   ├── utils
│   │   └── ApiResponse.js
│   │
│   └── app.js
│
├── package.json
└── README.md
```

---

## 🔑 API Modules

### 👤 User

* Register user
* Login user
* Update profile
* Subscribe / unsubscribe channels

### 📹 Video

* Upload video
* Update video
* Delete video
* Fetch videos
* Get channel videos

### 💬 Comments

* Add comment
* Update comment
* Delete comment
* Fetch video comments

### ❤️ Likes

* Like / Unlike video
* Like comments
* Like tweets

### 📝 Tweets

* Create tweet
* Update tweet
* Delete tweet
* Fetch tweets

### 📂 Playlists

* Create playlist
* Add video to playlist
* Remove video from playlist
* Fetch playlists

---

## ⚙️ Installation

Clone the repository

```
git clone https://github.com/YOUR_USERNAME/videotube-backend.git
```

Move into project

```
cd videotube-backend
```

Install dependencies

```
npm install
```

Create `.env` file

```
PORT=8000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start development server

```
npm run dev
```

---

## 📡 Example API Endpoints

### Upload Video

```
POST /api/v1/videos
```

### Get All Videos

```
GET /api/v1/videos
```

### Add Comment

```
POST /api/v1/comments/:videoId
```

### Like Video

```
POST /api/v1/likes/toggle/video/:videoId
```

### Create Playlist

```
POST /api/v1/playlists
```


## 👨‍💻 Author

**Tanmay Mishra**

* GitHub: [https://github.com/TanmayCloud251](https://github.com/TanmayCloud251)
* LinkedIn: [https://linkedin.com/in/tanmaymi251/](https://linkedin.com/in/tanmaymi251/)
* Email: [tanmaycloud251@gmail.com](mailto:tanmaycloud251@gmail.com)

## ⭐ Support

If you like this project, consider **starring the repository** ⭐