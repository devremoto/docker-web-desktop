<template>
  <div class="installation-view p-4">
    <!-- Header Section -->
    <div class="text-center mb-5">
      <div class="hero-section p-5 rounded">
        <i class="bi bi-download display-1 text-white mb-3"></i>
        <h1 class="display-4 text-white fw-bold mb-3">Installation Guidelines</h1>
        <p class="lead text-white-50 mb-4">Step-by-step guide to set up Docker Web Desktop</p>
        <p class="text-white">Get up and running with our Docker management interface</p>
      </div>
    </div>

    <!-- Prerequisites -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-warning text-dark">
            <h3 class="mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Prerequisites
            </h3>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h5 class="text-primary">Required Software</h5>
                <ul class="list-unstyled">
                  <li class="mb-2">
                    <i class="bi bi-check-circle text-success me-2"></i>
                    <strong>Docker Desktop</strong> or Docker Engine
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-check-circle text-success me-2"></i>
                    <strong>Node.js</strong> (v18 or higher)
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-check-circle text-success me-2"></i>
                    <strong>npm</strong> or <strong>yarn</strong>
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-check-circle text-success me-2"></i>
                    <strong>Git</strong> (for cloning the repository)
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h5 class="text-primary">System Requirements</h5>
                <ul class="list-unstyled">
                  <li class="mb-2">
                    <i class="bi bi-pc-display me-2 text-info"></i>
                    <strong>OS:</strong> Windows 10+, macOS 10.15+, or Linux
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-memory me-2 text-info"></i>
                    <strong>RAM:</strong> 4GB minimum, 8GB recommended
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-hdd me-2 text-info"></i>
                    <strong>Storage:</strong> 2GB free space
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-wifi me-2 text-info"></i>
                    <strong>Network:</strong> Internet connection for downloads
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Installation Steps -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">
              <i class="bi bi-list-ol me-2"></i>
              Installation Steps
            </h3>
          </div>
          <div class="card-body">
            <!-- Step 1 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">1</span>
                <h4 class="step-title">Clone the Repository</h4>
              </div>
              <p class="step-description">Download the Docker Web Desktop source code from GitHub.</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>git clone https://github.com/devremoto/docker-web-desktop.git
cd docker-web-desktop</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="git clone https://github.com/devremoto/docker-web-desktop.git&#10;cd docker-web-desktop">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">2</span>
                <h4 class="step-title">Install Dependencies</h4>
              </div>
              <p class="step-description">Install the required packages for both frontend and backend.</p>
              
              <h6 class="text-secondary">Frontend Dependencies:</h6>
              <div class="code-block mb-3">
                <pre class="bg-dark text-light p-3 rounded"><code>cd frontend
npm install</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="cd frontend&#10;npm install">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>

              <h6 class="text-secondary">Backend Dependencies:</h6>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>cd ../backend
npm install</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="cd ../backend&#10;npm install">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">3</span>
                <h4 class="step-title">Configure Environment</h4>
              </div>
              <p class="step-description">Set up environment variables and configuration files.</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code># Copy environment template
cp .env.example .env

# Edit configuration if needed
# Default settings should work for most setups</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="cp .env.example .env">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">4</span>
                <h4 class="step-title">Start the Application</h4>
              </div>
              <p class="step-description">Launch both frontend and backend servers.</p>
              
              <div class="row">
                <div class="col-md-6">
                  <h6 class="text-secondary">Option 1: Using Scripts (Recommended)</h6>
                  <div class="code-block">
                    <pre class="bg-dark text-light p-3 rounded"><code># Start backend
./start-backend.bat

# Start frontend (new terminal)
./start-frontend.bat</code></pre>
                    <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="./start-backend.bat">
                      <i class="bi bi-clipboard me-1"></i>Copy
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6 class="text-secondary">Option 2: Manual Start</h6>
                  <div class="code-block">
                    <pre class="bg-dark text-light p-3 rounded"><code># Backend (Terminal 1)
cd backend && npm start

# Frontend (Terminal 2)
cd frontend && npm run dev</code></pre>
                    <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="cd backend && npm start">
                      <i class="bi bi-clipboard me-1"></i>Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 5 -->
            <div class="installation-step">
              <div class="step-header">
                <span class="step-number">5</span>
                <h4 class="step-title">Access the Application</h4>
              </div>
              <p class="step-description">Open your browser and navigate to the application.</p>
              <div class="alert alert-success">
                <h6><i class="bi bi-globe me-2"></i>Application URLs:</h6>
                <ul class="mb-0">
                  <li><strong>Frontend:</strong> <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
                  <li><strong>Backend API:</strong> <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></li>
                  <li><strong>Health Check:</strong> <a href="http://localhost:3000/api/health" target="_blank">http://localhost:3000/api/health</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Docker Installation -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-info text-white">
            <h3 class="mb-0">
              <i class="bi bi-box me-2"></i>
              Docker Installation
            </h3>
          </div>
          <div class="card-body">
            <p class="lead">If you don't have Docker installed, follow these platform-specific guides:</p>
            
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="platform-card p-3 border rounded">
                  <h5><i class="bi bi-windows me-2 text-primary"></i>Windows</h5>
                  <ol class="small">
                    <li>Download Docker Desktop from <a href="https://docs.docker.com/desktop/install/windows/" target="_blank">Docker's website</a></li>
                    <li>Run the installer as Administrator</li>
                    <li>Enable WSL 2 when prompted</li>
                    <li>Restart your computer</li>
                    <li>Launch Docker Desktop</li>
                  </ol>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="platform-card p-3 border rounded">
                  <h5><i class="bi bi-apple me-2 text-dark"></i>macOS</h5>
                  <ol class="small">
                    <li>Download Docker Desktop from <a href="https://docs.docker.com/desktop/install/mac/" target="_blank">Docker's website</a></li>
                    <li>Open the .dmg file</li>
                    <li>Drag Docker to Applications</li>
                    <li>Launch Docker Desktop</li>
                    <li>Follow setup wizard</li>
                  </ol>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="platform-card p-3 border rounded">
                  <h5><i class="bi bi-ubuntu me-2 text-warning"></i>Linux</h5>
                  <ol class="small">
                    <li>Update package index: <code>sudo apt update</code></li>
                    <li>Install Docker: <code>sudo apt install docker.io</code></li>
                    <li>Start Docker: <code>sudo systemctl start docker</code></li>
                    <li>Add user to docker group: <code>sudo usermod -aG docker $USER</code></li>
                    <li>Log out and back in</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Troubleshooting -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-danger text-white">
            <h3 class="mb-0">
              <i class="bi bi-tools me-2"></i>
              Troubleshooting
            </h3>
          </div>
          <div class="card-body">
            <div class="accordion" id="troubleshootingAccordion">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
                    Port Already in Use
                  </button>
                </h2>
                <div id="collapse1" class="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                  <div class="accordion-body">
                    <p><strong>Problem:</strong> "Port 3000 is already in use" or "Port 5173 is already in use"</p>
                    <p><strong>Solution:</strong></p>
                    <div class="code-block">
                      <pre class="bg-light p-2 rounded"><code># Find process using the port
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID [PID_NUMBER] /F

# Or change port in package.json</code></pre>
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2">
                    Docker Connection Error
                  </button>
                </h2>
                <div id="collapse2" class="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                  <div class="accordion-body">
                    <p><strong>Problem:</strong> "Cannot connect to Docker daemon"</p>
                    <p><strong>Solution:</strong></p>
                    <ul>
                      <li>Ensure Docker Desktop is running</li>
                      <li>Check Docker status: <code>docker version</code></li>
                      <li>Restart Docker Desktop if needed</li>
                      <li>On Linux, start Docker service: <code>sudo systemctl start docker</code></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3">
                    Node.js Version Issues
                  </button>
                </h2>
                <div id="collapse3" class="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                  <div class="accordion-body">
                    <p><strong>Problem:</strong> Compatibility errors or npm install failures</p>
                    <p><strong>Solution:</strong></p>
                    <ul>
                      <li>Check Node.js version: <code>node --version</code></li>
                      <li>Update to Node.js 18+ from <a href="https://nodejs.org" target="_blank">nodejs.org</a></li>
                      <li>Clear npm cache: <code>npm cache clean --force</code></li>
                      <li>Delete node_modules and reinstall: <code>rm -rf node_modules && npm install</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Support Section -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h3 class="mb-0">
              <i class="bi bi-question-circle me-2"></i>
              Need Help?
            </h3>
          </div>
          <div class="card-body text-center">
            <p class="lead">If you encounter issues during installation, we're here to help!</p>
            <div class="row justify-content-center">
              <div class="col-md-3 mb-2">
                <a href="https://github.com/devremoto/docker-web-desktop/issues" target="_blank" class="btn btn-outline-primary w-100">
                  <i class="bi bi-github me-1"></i>Report Issue
                </a>
              </div>
              <div class="col-md-3 mb-2">
                <a href="https://github.com/devremoto/docker-web-desktop/discussions" target="_blank" class="btn btn-outline-info w-100">
                  <i class="bi bi-chat-dots me-1"></i>Discussions
                </a>
              </div>
              <div class="col-md-3 mb-2">
                <a href="/about" class="btn btn-outline-success w-100">
                  <i class="bi bi-person-circle me-1"></i>Contact Developer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Copy to clipboard functionality
const copyToClipboard = (button) => {
    const text = button.getAttribute('data-text')
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.innerHTML
            button.innerHTML = '<i class="bi bi-check me-1"></i>Copied!'
            button.classList.remove('btn-outline-primary')
            button.classList.add('btn-success')

            setTimeout(() => {
                button.innerHTML = originalText
                button.classList.remove('btn-success')
                button.classList.add('btn-outline-primary')
            }, 2000)
        })
    }
}

// Make function available globally
window.copyToClipboard = copyToClipboard
</script>

<style scoped>
.hero-section {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.installation-step {
    border-left: 4px solid #007bff;
    padding-left: 2rem;
    position: relative;
}

.step-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.step-number {
    background: #007bff;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
    position: absolute;
    left: -22px;
}

.step-title {
    margin: 0;
    color: #333;
}

.step-description {
    color: #666;
    margin-bottom: 1rem;
}

.code-block {
    position: relative;
}

.code-block pre {
    background-color: #212529 !important;
    color: #f8f9fa !important;
    border: 1px solid #495057;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    line-height: 1.4;
    overflow-x: auto;
}

.code-block pre code {
    background: transparent !important;
    color: inherit !important;
    padding: 0 !important;
    font-size: inherit !important;
}

.copy-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
}

.platform-card {
    height: 100%;
    transition: transform 0.2s, box-shadow 0.2s;
}

.platform-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: none;
}

.card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Inline code styling - not for code blocks */
:not(pre)>code {
    background: #f8f9fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.9em;
    color: #e83e8c;
    border: 1px solid #dee2e6;
}

@media (max-width: 768px) {
    .display-4 {
        font-size: 2rem;
    }

    .installation-step {
        padding-left: 1rem;
    }

    .step-number {
        left: -12px;
        width: 30px;
        height: 30px;
        font-size: 0.9rem;
    }
}
</style>