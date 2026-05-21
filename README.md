# 🐳 Docker Web Desktop

A modern, web-based Docker management interface built with Vue.js and Node.js that provides a Docker Desktop-like experience for managing containers, images, volumes, and networks.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://www.docker.com/)

*Manage your Docker containers, images, volumes, and networks with an intuitive web interface that rivals Docker Desktop*

[🚀 Quick Start](#quick-start) • [📖 Documentation](#documentation) • [🛠️ Features](#features) • [🤝 Contributing](#contributing)

## ✨ Features

### 🎨 **Modern Interface**

- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎯 **Intuitive UI**: Clean, user-friendly interface
- 🌈 **Bootstrap 5**: Modern styling and components
- 🔍 **Smart Port Detection**: Automatic protocol suggestions
- 📋 **Detailed Views**: Comprehensive resource information
- 🚀 **Fast Performance**: Optimized for speed and efficiency

### 🐳 **Docker Management**

- **Containers**: Start, stop, restart, remove, and view logs
- **Images**: View, remove, and inspect Docker images  
- **Volumes**: Manage Docker volumes with usage information
- **Networks**: Configure and manage Docker networks
- **Real-time Updates**: WebSocket integration for live status updates
- **Resource Statistics**: Dashboard with system overview

## 🏗️ Architecture

```
docker-web-desktop/
├── 🖥️ backend/                 # Node.js Express API Server
│   ├── src/
│   │   ├── routes/            # RESTful API endpoints
│   │   │   ├── containers.js  # Container management
│   │   │   ├── images.js      # Image operations
│   │   │   ├── volumes.js     # Volume management
│   │   │   └── networks.js    # Network configuration
│   │   ├── services/
│   │   │   └── docker.js      # Docker API integration
│   │   └── server.js          # Main application server
│   └── package.json
│
├── 🎨 frontend/                # Vue.js Single Page Application
│   ├── src/
│   │   ├── components/        # Reusable Vue components
│   │   │   ├── Sidebar.vue    # Navigation sidebar
│   │   │   ├── ContainerCard.vue
│   │   │   └── ...
│   │   ├── views/             # Page components
│   │   │   ├── DashboardView.vue
│   │   │   ├── ContainersView.vue
│   │   │   ├── ResourcesView.vue
│   │   │   ├── InstallationView.vue
│   │   │   └── AboutView.vue
│   │   ├── stores/            # Pinia state management
│   │   ├── services/          # API communication layer
│   │   ├── router/            # Vue Router configuration
│   │   └── main.js
│   └── package.json
│
├── 📝 README.md
├── 📋 instructions.txt
└── 🔧 Configuration files
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| 🟢 **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| 🐳 **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| 📦 **npm** | 8+ | Included with Node.js |
| 🔧 **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Windows + WSL2 Quick Install

If you are on Windows and want Docker Engine running inside WSL (with Docker Compose), use the automated scripts:

```bat
:: Run as Administrator from project root
public\install-wsl2.bat
```

What the script does:

- Checks and installs Node.js LTS (via winget when available)
- Installs/enables WSL2 and Ubuntu
- Calls bash inside WSL to install Docker Engine and Docker Compose
- Verifies both with `docker --version` and compose version checks

You can also run the Linux-side script directly inside Ubuntu/WSL:

```bash
chmod +x public/install-docker-wsl2.sh
./public/install-docker-wsl2.sh
```

Verify after installation inside WSL:

```bash
docker --version
docker compose version
docker run hello-world
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/devremoto/docker-web-desktop.git
   cd docker-web-desktop
   ```

2. **Install dependencies**

   ```bash
   # Backend dependencies
   cd backend && npm install
   
   # Frontend dependencies
   cd ../frontend && npm install
   ```

3. **Start the application**

   ```bash
   # Terminal 1: Start backend (from project root)
   cd backend && npm run dev
   
   # Terminal 2: Start frontend (from project root)
   cd frontend && npm run dev
   ```

4. **Access the application**
   - 🌐 **Frontend**: <http://localhost:5173>
   - 🔧 **Backend API**: <http://localhost:3000>
   - ❤️ **Health Check**: <http://localhost:3000/api/health>

> 💡 **Tip**: Use the provided batch scripts on Windows: `start-backend.bat` and `start-frontend.bat`

> 💡 **WSL2 Tip**: If your project uses `docker-compose.yml`, run compose commands from inside WSL for the WSL daemon:

```bash
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

## 📖 Documentation

### 🔌 API Reference

<details>
<summary><strong>🗂️ Container Endpoints</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/containers` | List all containers |
| `GET` | `/api/containers/:id` | Get container details |
| `POST` | `/api/containers/:id/start` | Start container |
| `POST` | `/api/containers/:id/stop` | Stop container |
| `DELETE` | `/api/containers/:id` | Remove container |
| `GET` | `/api/containers/:id/logs` | Get container logs |

</details>

<details>
<summary><strong>🖼️ Image Endpoints</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/images` | List all images |
| `GET` | `/api/images/:id` | Get image details |
| `DELETE` | `/api/images/:id` | Remove image |

</details>

<details>
<summary><strong>💾 Volume Endpoints</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/volumes` | List all volumes |
| `DELETE` | `/api/volumes/:name` | Remove volume |

</details>

<details>
<summary><strong>🌐 Network Endpoints</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/networks` | List all networks |
| `DELETE` | `/api/networks/:id` | Remove network |

</details>

### 🛠️ Technology Stack

#### Backend Technologies

- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) **Node.js** - JavaScript runtime
- ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) **Express.js** - Web framework
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) **Dockerode** - Docker API client
- ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) **Socket.IO** - Real-time communication

#### Frontend Technologies

- ![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white) **Vue.js 3** - Progressive framework
- ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat&logo=bootstrap&logoColor=white) **Bootstrap 5** - CSS framework
- ![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=flat&logo=pinia&logoColor=black) **Pinia** - State management
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) **Vite** - Build tool

### ⚙️ Configuration

#### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Docker Configuration (automatically detected)
# DOCKER_SOCKET_PATH=/var/run/docker.sock    # Linux/Mac
# Windows uses: \\.\pipe\docker_engine

# CORS Settings
FRONTEND_URL=http://localhost:5173
```

#### Port Configuration

| Service | Default Port | Environment Variable |
|---------|-------------|---------------------|
| Backend API | 3000 | `PORT` |
| Frontend Dev | 5173 | Configured in `vite.config.js` |
| WebSocket | 3000 | Same as backend |

## 🔧 Development

### Available Scripts

#### Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
```

#### Frontend Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### 🐛 Debugging & Troubleshooting

<details>
<summary><strong>🔧 Common Issues</strong></summary>

#### Docker Connection Issues

```bash
# Check Docker status
docker version
docker ps

# On Linux/Mac - Fix permissions
sudo chmod 666 /var/run/docker.sock
sudo usermod -aG docker $USER

# Restart Docker Desktop
```

#### Port Conflicts

```bash
# Find process using port
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # Mac/Linux

# Kill process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                   # Mac/Linux
```

#### Node.js Version Issues

```bash
# Check version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

</details>

## 🚢 Deployment

### Production Build

1. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Configure backend for production**

   ```bash
   cd backend
   npm install --production
   ```

3. **Start production server**

   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- 📝 Follow existing code style
- ✅ Add tests for new features
- 📚 Update documentation
- 🧪 Test thoroughly before submitting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Adilson de Almeida Pedro**

- 🌐 Website: [adilson.almeidapedro.com.br](http://adilson.almeidapedro.com.br)
- 🐙 GitHub: [@devremoto](https://github.com/devremoto)
- 🐦 Twitter: [@zumcoder](https://twitter.com/zumcoder)
- 💼 LinkedIn: [Adilson Pedro](https://www.linkedin.com/in/adilsonpedro/)
- 💬 WhatsApp: +351 924 498 223 | +55 11 9353-6732

## 💖 Support

If you find this project helpful, consider supporting its development:

- ⭐ **Star** this repository
- 🐛 **Report** bugs and suggest features
- 🤝 **Contribute** to the codebase
- ☕ **Buy me a coffee** via [Ko-fi](https://ko-fi.com/devremoto)

## 🙏 Acknowledgments

- 🐳 **Docker** team for the amazing containerization platform
- 🎨 **Vue.js** team for the excellent frontend framework
- 🎯 **Bootstrap** team for the beautiful UI components
- 🌟 **Open Source Community** for the incredible tools and libraries

---

<div align="center">

**Built with ❤️ by [Adilson Pedro](https://github.com/devremoto)**

*Star ⭐ this repository if you find it useful!*

</div>
