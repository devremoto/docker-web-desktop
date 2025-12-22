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

    <!-- WSL2 Installation Guide -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header text-white" style="background: linear-gradient(135deg, #0078d4 0%, #00bcf2 100%);">
            <h3 class="mb-0">
              <i class="bi bi-microsoft me-2"></i>
              WSL2 Installation Guide (Windows)
            </h3>
          </div>
          <div class="card-body">
            <p class="lead mb-4">
              Windows Subsystem for Linux 2 (WSL2) allows you to run a Linux environment directly on Windows. 
              This is the recommended way to run Docker on Windows.
            </p>

            <!-- Automated WSL2 Installation -->
            <div class="alert alert-success mb-4">
              <h5><i class="bi bi-lightning-charge me-2"></i>Quick Installation (Recommended)</h5>
              <p class="mb-3">Download and run our automated installation script that handles the complete WSL2 installation:</p>
              
              <!-- PowerShell Version -->
              <div class="mb-3">
                <h6 class="mb-2"><i class="bi bi-terminal me-2"></i>PowerShell Version (Recommended)</h6>
                <div class="d-flex gap-2">
                  <button class="btn btn-success" @click="downloadWSL2Script">
                    <i class="bi bi-download me-2"></i>Download PowerShell Script (.ps1)
                  </button>
                  <button class="btn btn-outline-success" @click="copyWSL2Script">
                    <i class="bi bi-clipboard me-2"></i>Copy PowerShell Script
                  </button>
                </div>
              </div>

              <!-- Batch File Version -->
              <div class="mb-3">
                <h6 class="mb-2"><i class="bi bi-terminal-fill me-2"></i>Batch File Version (Alternative)</h6>
                <div class="d-flex gap-2">
                  <button class="btn btn-primary" @click="downloadWSL2BatchScript">
                    <i class="bi bi-download me-2"></i>Download Batch Script (.bat)
                  </button>
                  <button class="btn btn-outline-primary" @click="copyWSL2BatchScript">
                    <i class="bi bi-clipboard me-2"></i>Copy Batch Script
                  </button>
                </div>
              </div>

              <div class="bg-white p-3 rounded border text-dark">
                <strong class="text-dark">How to use (PowerShell):</strong>
                <ol class="mb-2 mt-2 text-dark">
                  <li>Download the PowerShell script (.ps1) using the button above</li>
                  <li>Right-click PowerShell and select <strong>"Run as Administrator"</strong></li>
                  <li>Navigate to download folder: <code>cd $HOME\Downloads</code></li>
                  <li>Run: <code>.\install-wsl2.ps1</code></li>
                  <li>Follow the prompts and restart when complete</li>
                </ol>
                <strong class="text-dark">How to use (Batch File):</strong>
                <ol class="mb-0 mt-2 text-dark">
                  <li>Download the Batch script (.bat) using the button above</li>
                  <li>Right-click <code>install-wsl2.bat</code> and select <strong>"Run as administrator"</strong></li>
                  <li>Follow the prompts and restart when complete</li>
                </ol>
              </div>
            </div>

            <hr class="my-4">
            
            <h4 class="text-primary mb-4">Manual Installation Steps</h4>
            <p class="text-muted mb-4">If you prefer to install WSL2 manually, follow these steps:</p>

            <!-- Step 1: Enable WSL -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">1</span>
                <h4 class="step-title">Enable WSL and Virtual Machine Platform</h4>
              </div>
              <p class="step-description">Open PowerShell as Administrator and run:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>wsl --install</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="wsl --install">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
              <p class="text-muted small mt-2">This command will enable WSL, Virtual Machine Platform, and install Ubuntu by default.</p>
              
              <div class="alert alert-info mt-3">
                <strong>Alternative (Manual):</strong> If automatic install doesn't work, enable features manually:
                <div class="code-block mt-2">
                  <pre class="bg-dark text-light p-3 rounded"><code>dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart</code></pre>
                  <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart&#10;dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart">
                    <i class="bi bi-clipboard me-1"></i>Copy
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2: Restart -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">2</span>
                <h4 class="step-title">Restart Your Computer</h4>
              </div>
              <p class="step-description">Restart Windows to apply the changes.</p>
            </div>

            <!-- Step 3: Update WSL Kernel -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">3</span>
                <h4 class="step-title">Update WSL Kernel</h4>
              </div>
              <p class="step-description">Download and install the WSL2 Linux kernel update:</p>
              <ul>
                <li>Download: <a href="https://aka.ms/wsl2kernel" target="_blank">WSL2 Linux Kernel Update Package</a></li>
                <li>Run the installer</li>
              </ul>
            </div>

            <!-- Step 4: Set WSL2 as Default -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">4</span>
                <h4 class="step-title">Set WSL2 as Default Version</h4>
              </div>
              <p class="step-description">Open PowerShell and run:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>wsl --set-default-version 2</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="wsl --set-default-version 2">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Step 5: Install Linux Distribution -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">5</span>
                <h4 class="step-title">Install a Linux Distribution</h4>
              </div>
              <p class="step-description">Install Ubuntu (or your preferred distribution):</p>
              
              <h6 class="text-secondary">Option A: From Microsoft Store</h6>
              <ul class="mb-3">
                <li>Open Microsoft Store</li>
                <li>Search for "Ubuntu" (Ubuntu 22.04 LTS recommended)</li>
                <li>Click "Get" or "Install"</li>
                <li>Launch Ubuntu and create a user account</li>
              </ul>

              <h6 class="text-secondary">Option B: Command Line</h6>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code># List available distributions
wsl --list --online

# Install Ubuntu
wsl --install -d Ubuntu-22.04</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="wsl --install -d Ubuntu-22.04">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Step 6: Verify Installation -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">6</span>
                <h4 class="step-title">Verify WSL2 Installation</h4>
              </div>
              <p class="step-description">Check that WSL2 is running properly:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code># List installed distributions
wsl --list --verbose

# Should show VERSION 2</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="wsl --list --verbose">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <hr class="my-4">

            <!-- Docker on WSL2 -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h3 class="text-primary mb-0">
                <i class="bi bi-box-seam me-2"></i>
                Installing Docker on WSL2
              </h3>
              <div>
                <button class="btn btn-success me-2" @click="downloadDockerScript">
                  <i class="bi bi-download me-2"></i>Download Installation Script
                </button>
                <button class="btn btn-outline-primary" @click="copyFullScript">
                  <i class="bi bi-clipboard me-2"></i>Copy Full Script
                </button>
              </div>
            </div>

            <div class="alert alert-info mb-4">
              <h6><i class="bi bi-info-circle me-2"></i>Automated Installation</h6>
              <p class="mb-2">You can download and run our automated installation script that performs all the steps below:</p>
              <ol class="mb-0">
                <li>Download the script using the button above</li>
                <li>In WSL2 terminal: <code>chmod +x install-docker-wsl2.sh</code></li>
                <li>Run: <code>./install-docker-wsl2.sh</code></li>
              </ol>
            </div>

            <!-- Docker Installation Step 1 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">1</span>
                <h4 class="step-title">Update Package Repository</h4>
              </div>
              <p class="step-description">Open your WSL2 terminal (Ubuntu) and update packages:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>sudo apt update && sudo apt upgrade -y</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="sudo apt update && sudo apt upgrade -y">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Docker Installation Step 2 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">2</span>
                <h4 class="step-title">Install Prerequisites</h4>
              </div>
              <p class="step-description">Install required packages:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Docker Installation Step 3 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">3</span>
                <h4 class="step-title">Add Docker's Official GPG Key</h4>
              </div>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="sudo mkdir -p /etc/apt/keyrings&#10;curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Docker Installation Step 4 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">4</span>
                <h4 class="step-title">Set Up Docker Repository</h4>
              </div>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="echo &quot;deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable&quot; | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Docker Installation Step 5 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">5</span>
                <h4 class="step-title">Install Docker Engine</h4>
              </div>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="sudo apt update&#10;sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <!-- Docker Installation Step 6 -->
            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">6</span>
                <h4 class="step-title">Add User to Docker Group</h4>
              </div>
              <p class="step-description">Run Docker without sudo:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>sudo usermod -aG docker $USER
newgrp docker</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="sudo usermod -aG docker $USER&#10;newgrp docker">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <hr class="my-4">

            <!-- Running Docker Engine -->
            <h3 class="text-success mb-4">
              <i class="bi bi-play-circle me-2"></i>
              Running Docker Engine on WSL2
            </h3>

            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">1</span>
                <h4 class="step-title">Start Docker Service</h4>
              </div>
              <p class="step-description">Start the Docker daemon:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>sudo service docker start</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="sudo service docker start">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <div class="installation-step mb-4">
              <div class="step-header">
                <span class="step-number">2</span>
                <h4 class="step-title">Verify Docker is Running</h4>
              </div>
              <p class="step-description">Test the installation:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code># Check Docker version
docker --version

# Check Docker status
sudo service docker status

# Run test container
docker run hello-world</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="docker --version&#10;sudo service docker status&#10;docker run hello-world">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <div class="installation-step">
              <div class="step-header">
                <span class="step-number">3</span>
                <h4 class="step-title">Auto-Start Docker (Optional)</h4>
              </div>
              <p class="step-description">Make Docker start automatically when WSL2 launches:</p>
              <p class="small text-muted">Add to <code>~/.bashrc</code> or <code>~/.zshrc</code>:</p>
              <div class="code-block">
                <pre class="bg-dark text-light p-3 rounded"><code>echo '# Start Docker daemon automatically' >> ~/.bashrc
echo 'if ! service docker status > /dev/null 2>&1; then' >> ~/.bashrc
echo '    sudo service docker start > /dev/null 2>&1' >> ~/.bashrc
echo 'fi' >> ~/.bashrc
source ~/.bashrc</code></pre>
                <button class="btn btn-sm btn-outline-primary copy-btn" onclick="copyToClipboard(this)" data-text="echo '# Start Docker daemon automatically' >> ~/.bashrc&#10;echo 'if ! service docker status > /dev/null 2>&1; then' >> ~/.bashrc&#10;echo '    sudo service docker start > /dev/null 2>&1' >> ~/.bashrc&#10;echo 'fi' >> ~/.bashrc&#10;source ~/.bashrc">
                  <i class="bi bi-clipboard me-1"></i>Copy
                </button>
              </div>
            </div>

            <div class="alert alert-success mt-4">
              <h5><i class="bi bi-check-circle me-2"></i>Success!</h5>
              <p class="mb-0">Docker is now running on WSL2. You can use this Docker Desktop Web UI by selecting "WSL2" as the container source in the app.</p>
            </div>

            <div class="alert alert-warning mt-3">
              <h6><i class="bi bi-lightbulb me-2"></i>Tip:</h6>
              <p class="mb-0">To stop Docker: <code>sudo service docker stop</code></p>
              <p class="mb-0">To restart Docker: <code>sudo service docker restart</code></p>
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

// Download the Docker installation script
const downloadDockerScript = () => {
  const link = document.createElement('a')
  link.href = '/install-docker-wsl2.sh'
  link.download = 'install-docker-wsl2.sh'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Copy the full script content to clipboard
const copyFullScript = async () => {
  try {
    const response = await fetch('/install-docker-wsl2.sh')
    const scriptContent = await response.text()

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(scriptContent)
      // Show success feedback (you could add a toast notification here)
      alert('Docker installation script copied to clipboard!')
    }
  } catch (error) {
    console.error('Failed to copy script:', error)
    alert('Failed to copy script. Please try downloading it instead.')
  }
}

// Download the WSL2 installation script
const downloadWSL2Script = () => {
  const link = document.createElement('a')
  link.href = '/install-wsl2.ps1'
  link.download = 'install-wsl2.ps1'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Copy the WSL2 installation script to clipboard
const copyWSL2Script = async () => {
  try {
    const response = await fetch('/install-wsl2.ps1')
    const scriptContent = await response.text()

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(scriptContent)
      alert('WSL2 PowerShell script copied to clipboard!')
    }
  } catch (error) {
    console.error('Failed to copy WSL2 script:', error)
    alert('Failed to copy script. Please try downloading it instead.')
  }
}

// Download the WSL2 batch installation script
const downloadWSL2BatchScript = () => {
  const link = document.createElement('a')
  link.href = '/install-wsl2.bat'
  link.download = 'install-wsl2.bat'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Copy the WSL2 batch installation script to clipboard
const copyWSL2BatchScript = async () => {
  try {
    const response = await fetch('/install-wsl2.bat')
    const scriptContent = await response.text()

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(scriptContent)
      alert('WSL2 Batch script copied to clipboard!')
    }
  } catch (error) {
    console.error('Failed to copy WSL2 batch script:', error)
    alert('Failed to copy script. Please try downloading it instead.')
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
  background: #0056b3;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
}

.step-title {
  margin: 0;
  color: #f8f9fa;
  font-weight: 600;
}

.step-description {
  color: #e5e7eb;
  margin-bottom: 1rem;
}

.installation-view {
  background-color: #0b0f17;
  color: #f8f9fa;
}

.installation-view .card {
  background-color: #0f172a;
  color: #f8f9fa;
}

.installation-view .card h3,
.installation-view .card h4,
.installation-view .card h5,
.installation-view .card h6,
.installation-view .card p,
.installation-view .card li,
.installation-view .card ol,
.installation-view .card ul {
  color: #e5e7eb;
}

.installation-view .alert {
  background-color: #111827;
  color: #f8f9fa;
  border-color: #334155;
}

/* Ensure instruction boxes remain high-contrast */
.installation-view .bg-white {
  background-color: #111827 !important;
  color: #f8f9fa !important;
  border-color: #334155 !important;
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