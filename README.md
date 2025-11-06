# 🐳 Docker Web Desktop



<div align="center">A Docker management application with a Node.js backend and Vue.js frontend that provides a Docker Desktop-like interface for managing Docker containers, images, volumes, and networks.



[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)## Features

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)- **Dashboard**: Overview of Docker resources with real-time statistics

[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://www.docker.com/)- **Containers Management**: Start, stop, remove containers, and view logs

- **Images Management**: View and remove Docker images

**A modern, web-based Docker management interface built with Vue.js and Node.js**- **Volumes Management**: View and remove Docker volumes

- **Networks Management**: View and remove Docker networks (except system networks)

*Manage your Docker containers, images, volumes, and networks with an intuitive web interface that rivals Docker Desktop*- **Real-time Updates**: WebSocket integration for live updates

- **Bootstrap UI**: Modern and responsive user interface

[🚀 Quick Start](#quick-start) • [📖 Documentation](#documentation) • [🛠️ Features](#features) • [🤝 Contributing](#contributing)

## Architecture

</div>

```

---├── backend/          # Node.js Express API server

│   ├── src/

## 🌟 Features│   │   ├── routes/   # API routes for containers, images, volumes, networks

│   │   ├── services/ # Docker integration service

<table>│   │   └── server.js # Main server file

<tr>│   └── package.json

<td width="50%">├── frontend/         # Vue.js frontend application

│   ├── src/

### 📊 **Comprehensive Management**│   │   ├── components/ # Reusable Vue components

- 🗂️ **Dashboard**: Real-time Docker resource overview│   │   ├── views/      # Page components

- 📦 **Containers**: Full lifecycle management (start, stop, remove, logs)│   │   ├── stores/     # Pinia state management

- 🖼️ **Images**: View, inspect, and remove Docker images│   │   ├── services/   # API service layer

- 💾 **Volumes**: Manage persistent data storage│   │   └── router/     # Vue Router configuration

- 🌐 **Networks**: Configure container networking│   └── package.json

- ⚡ **Real-time Updates**: Live statistics and status changes└── README.md

```

</td>

<td width="50%">## Prerequisites



### 🎨 **Modern Interface**- **Node.js** (v16 or higher)

- 📱 **Responsive Design**: Works on desktop, tablet, and mobile- **Docker Desktop** running on your system

- 🎯 **Intuitive UI**: Clean, user-friendly interface- **npm** or **yarn** package manager

- 🌈 **Bootstrap 5**: Modern styling and components

- 🔍 **Smart Port Detection**: Automatic protocol suggestions## Installation & Setup

- 📋 **Detailed Views**: Comprehensive resource information

- 🚀 **Fast Performance**: Optimized for speed and efficiency### 1. Clone the repository

```bash

</td>git clone <repository-url>

</tr>cd docker-desktop-clone

</table>```



## 🏗️ Architecture### 2. Backend Setup

```bash

```cd backend

docker-web-desktop/npm install

├── 🖥️ backend/                 # Node.js Express API Server```

│   ├── src/

│   │   ├── routes/            # RESTful API endpoints### 3. Frontend Setup

│   │   │   ├── containers.js  # Container management```bash

│   │   │   ├── images.js      # Image operationscd ../frontend

│   │   │   ├── volumes.js     # Volume managementnpm install

│   │   │   └── networks.js    # Network configuration```

│   │   ├── services/

│   │   │   └── docker.js      # Docker API integration## Running the Application

│   │   └── server.js          # Main application server

│   └── package.json### 1. Start the Backend Server

│```bash

├── 🎨 frontend/                # Vue.js Single Page Applicationcd backend

│   ├── src/npm run dev

│   │   ├── components/        # Reusable Vue components# Server will run on http://localhost:3000

│   │   │   ├── Sidebar.vue    # Navigation sidebar```

│   │   │   ├── ContainerCard.vue

│   │   │   └── ...### 2. Start the Frontend Development Server

│   │   ├── views/             # Page components```bash

│   │   │   ├── DashboardView.vuecd frontend

│   │   │   ├── ContainersView.vuenpm run dev

│   │   │   ├── ResourcesView.vue# Application will run on http://localhost:5173 (or another available port)

│   │   │   ├── InstallationView.vue```

│   │   │   └── AboutView.vue

│   │   ├── stores/            # Pinia state management### 3. Access the Application

│   │   ├── services/          # API communication layerOpen your browser and navigate to the frontend URL (typically `http://localhost:5173`)

│   │   ├── router/            # Vue Router configuration

│   │   └── main.js## API Endpoints

│   └── package.json

│### Containers

├── 📝 README.md- `GET /api/containers` - List all containers

├── 📋 instructions.txt- `GET /api/containers/:id` - Get specific container details

└── 🔧 Configuration files- `POST /api/containers/:id/start` - Start a container

```- `POST /api/containers/:id/stop` - Stop a container

- `DELETE /api/containers/:id` - Remove a container

## 🚀 Quick Start- `GET /api/containers/:id/logs` - Get container logs



### Prerequisites### Images

- `GET /api/images` - List all images

Before you begin, ensure you have the following installed:- `DELETE /api/images/:id` - Remove an image



| Requirement | Version | Download |### Volumes

|-------------|---------|----------|- `GET /api/volumes` - List all volumes

| 🟢 **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |- `DELETE /api/volumes/:name` - Remove a volume

| 🐳 **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |

| 📦 **npm** | 8+ | Included with Node.js |### Networks

| 🔧 **Git** | Latest | [git-scm.com](https://git-scm.com/) |- `GET /api/networks` - List all networks

- `DELETE /api/networks/:id` - Remove a network

### Installation

### Health Check

1. **Clone the repository**- `GET /api/health` - API health check

   ```bash

   git clone https://github.com/devremoto/docker-web-desktop.git## Technology Stack

   cd docker-web-desktop

   ```### Backend

- **Node.js** - Runtime environment

2. **Install dependencies**- **Express.js** - Web application framework

   ```bash- **Dockerode** - Docker API client for Node.js

   # Backend dependencies- **Socket.IO** - Real-time bidirectional event-based communication

   cd backend && npm install- **CORS** - Cross-Origin Resource Sharing middleware

   

   # Frontend dependencies### Frontend

   cd ../frontend && npm install- **Vue.js 3** - Progressive JavaScript framework

   ```- **Vue Router** - Official router for Vue.js

- **Pinia** - State management library

3. **Start the application**- **Bootstrap 5** - CSS framework for responsive design

   ```bash- **Bootstrap Icons** - Icon library

   # Terminal 1: Start backend (from project root)- **Axios** - HTTP client for API requests

   cd backend && npm run dev- **Socket.IO Client** - Real-time updates from backend

   

   # Terminal 2: Start frontend (from project root)## Configuration

   cd frontend && npm run dev

   ```### Environment Variables



4. **Access the application**Backend (`.env` file):

   - 🌐 **Frontend**: http://localhost:5173```

   - 🔧 **Backend API**: http://localhost:3000PORT=3000

   - ❤️ **Health Check**: http://localhost:3000/api/healthDOCKER_SOCKET_PATH=/var/run/docker.sock  # Linux/Mac

# On Windows, the app automatically uses named pipe: \\.\pipe\docker_engine

> 💡 **Tip**: Use the provided batch scripts on Windows: `start-backend.bat` and `start-frontend.bat````



## 📖 Documentation### CORS Configuration

The backend is configured to accept requests from `http://localhost:8080` and the default Vite dev server ports.

### 🔌 API Reference

## Development Scripts

<details>

<summary><strong>🗂️ Container Endpoints</strong></summary>### Backend

- `npm start` - Start production server

| Method | Endpoint | Description |- `npm run dev` - Start development server with nodemon

|--------|----------|-------------|

| `GET` | `/api/containers` | List all containers |### Frontend

| `GET` | `/api/containers/:id` | Get container details |- `npm run dev` - Start development server

| `POST` | `/api/containers/:id/start` | Start container |- `npm run build` - Build for production

| `POST` | `/api/containers/:id/stop` | Stop container |- `npm run preview` - Preview production build

| `DELETE` | `/api/containers/:id` | Remove container |

| `GET` | `/api/containers/:id/logs` | Get container logs |## Troubleshooting



</details>### Common Issues



<details>1. **Docker connection errors**

<summary><strong>🖼️ Image Endpoints</strong></summary>   - Ensure Docker Desktop is running

   - Check Docker daemon is accessible

| Method | Endpoint | Description |   - On Windows, verify named pipe access

|--------|----------|-------------|

| `GET` | `/api/images` | List all images |2. **CORS errors**

| `GET` | `/api/images/:id` | Get image details |   - Check frontend URL matches backend CORS configuration

| `DELETE` | `/api/images/:id` | Remove image |   - Verify both servers are running on expected ports



</details>3. **Connection refused**

   - Ensure backend server is running on port 3000

<details>   - Check firewall settings

<summary><strong>💾 Volume Endpoints</strong></summary>

### Docker Socket Permissions (Linux/Mac)

| Method | Endpoint | Description |```bash

|--------|----------|-------------|sudo chmod 666 /var/run/docker.sock

| `GET` | `/api/volumes` | List all volumes |# Or add user to docker group:

| `DELETE` | `/api/volumes/:name` | Remove volume |sudo usermod -aG docker $USER

```

</details>

## Features in Detail

<details>

<summary><strong>🌐 Network Endpoints</strong></summary>### Real-time Updates

The application uses WebSocket connections to provide real-time updates when:

| Method | Endpoint | Description |- Container states change (start/stop)

|--------|----------|-------------|- Containers are removed

| `GET` | `/api/networks` | List all networks |- Images are removed

| `DELETE` | `/api/networks/:id` | Remove network |- Volumes are removed

- Networks are removed

</details>

### Error Handling

### 🛠️ Technology Stack- Comprehensive error handling on both frontend and backend

- User-friendly error messages

#### Backend Technologies- Loading states and feedback

- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) **Node.js** - JavaScript runtime

- ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) **Express.js** - Web framework### Responsive Design

- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) **Dockerode** - Docker API client- Mobile-friendly interface using Bootstrap

- ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) **Socket.IO** - Real-time communication- Responsive tables and navigation

- Touch-friendly controls

#### Frontend Technologies

- ![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white) **Vue.js 3** - Progressive framework## Contributing

- ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat&logo=bootstrap&logoColor=white) **Bootstrap 5** - CSS framework

- ![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=flat&logo=pinia&logoColor=black) **Pinia** - State management1. Fork the repository

- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) **Vite** - Build tool2. Create a feature branch

3. Make your changes

### ⚙️ Configuration4. Test thoroughly

5. Submit a pull request

#### Environment Variables

## License

Create a `.env` file in the backend directory:

This project is licensed under the MIT License.

```bash

# Server Configuration## Acknowledgments

PORT=3000

NODE_ENV=development- Docker for providing the container platform

- Vue.js team for the excellent frontend framework

# Docker Configuration (automatically detected)- Bootstrap team for the UI framework

# DOCKER_SOCKET_PATH=/var/run/docker.sock    # Linux/Mac- The open-source community for the various libraries used
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