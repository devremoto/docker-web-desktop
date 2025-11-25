<template>
  <div class="resources-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">
        <i class="bi bi-book me-2 text-primary"></i>
        Docker Resources
      </h1>
    </div>

    <div class="row">
      <!-- Docker Resources -->
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="bi bi-box me-2"></i>
              Docker
            </h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-3 text-muted">Essential Docker Resources</h6>
            
            <div class="resource-section mb-4">
              <h6 class="fw-bold">📚 Documentation</h6>
              <ul class="list-unstyled">
                <li><a href="https://docs.docker.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Official Docker Docs
                </a></li>
                <li><a href="https://docs.docker.com/get-started/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Docker Get Started Guide
                </a></li>
                <li><a href="https://docs.docker.com/reference/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Docker CLI Reference
                </a></li>
              </ul>
            </div>

            <div class="resource-section mb-4">
              <h6 class="fw-bold">🎓 Learning</h6>
              <ul class="list-unstyled">
                <li><a href="https://www.docker.com/101-tutorial/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Docker 101 Tutorial
                </a></li>
                <li><a href="https://labs.play-with-docker.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Play with Docker
                </a></li>
                <li><a href="https://dockerlabs.collabnix.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Docker Labs
                </a></li>
              </ul>
            </div>

            <div class="resource-section">
              <h6 class="fw-bold">🛠️ Tools</h6>
              <ul class="list-unstyled">
                <li><a href="https://hub.docker.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Docker Hub
                </a></li>
                <li><a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Docker Desktop
                </a></li>
                <li><a href="https://github.com/docker/awesome-docker" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Awesome Docker
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Docker Compose Resources -->
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-layers me-2"></i>
              Docker Compose
            </h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-3 text-muted">Multi-container Applications</h6>
            
            <div class="resource-section mb-4">
              <h6 class="fw-bold">📚 Documentation</h6>
              <ul class="list-unstyled">
                <li><a href="https://docs.docker.com/compose/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Compose Documentation
                </a></li>
                <li><a href="https://docs.docker.com/compose/compose-file/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Compose File Reference
                </a></li>
                <li><a href="https://docs.docker.com/compose/environment-variables/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Environment Variables
                </a></li>
              </ul>
            </div>

            <div class="resource-section mb-4">
              <h6 class="fw-bold">📘 Examples</h6>
              <ul class="list-unstyled">
                <li><a href="https://github.com/docker/awesome-compose" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Awesome Compose
                </a></li>
                <li><a href="https://docs.docker.com/compose/samples-for-compose/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Compose Samples
                </a></li>
                <li><a href="https://github.com/compose-spec/compose-spec" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Compose Specification
                </a></li>
              </ul>
            </div>

            <div class="resource-section">
              <h6 class="fw-bold">🔧 Tools</h6>
              <ul class="list-unstyled">
                <li><a href="https://www.composerize.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Composerize
                </a></li>
                <li><a href="https://docs.docker.com/compose/install/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Install Compose
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Kubernetes Resources -->
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">
              <i class="bi bi-diagram-3 me-2"></i>
              Kubernetes
            </h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-3 text-muted">Container Orchestration</h6>
            
            <div class="resource-section mb-4">
              <h6 class="fw-bold">📚 Documentation</h6>
              <ul class="list-unstyled">
                <li><a href="https://kubernetes.io/docs/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Kubernetes Docs
                </a></li>
                <li><a href="https://kubernetes.io/docs/tutorials/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>K8s Tutorials
                </a></li>
                <li><a href="https://kubernetes.io/docs/reference/kubectl/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>kubectl Reference
                </a></li>
              </ul>
            </div>

            <div class="resource-section mb-4">
              <h6 class="fw-bold">🎓 Learning</h6>
              <ul class="list-unstyled">
                <li><a href="https://labs.play-with-k8s.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Play with Kubernetes
                </a></li>
                <li><a href="https://katacoda.com/courses/kubernetes" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Katacoda K8s
                </a></li>
                <li><a href="https://kubernetes.io/training/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>K8s Training
                </a></li>
              </ul>
            </div>

            <div class="resource-section">
              <h6 class="fw-bold">🛠️ Tools</h6>
              <ul class="list-unstyled">
                <li><a href="https://minikube.sigs.k8s.io/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Minikube
                </a></li>
                <li><a href="https://kind.sigs.k8s.io/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Kind
                </a></li>
                <li><a href="https://k3s.io/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-box-arrow-up-right me-1"></i>K3s
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Commands Section -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
              <i class="bi bi-terminal me-2"></i>
              Quick Reference Commands
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <h6 class="fw-bold text-primary">Docker Commands</h6>
                <div class="code-block">
                  <pre class="bg-light p-2 rounded text-sm">
# List containers
docker ps -a

# Build image
docker build -t myapp .

# Run container
docker run -d -p 8080:80 myapp

# View logs
docker logs container_name

# Execute into container
docker exec -it container_name bash
                  </pre>
                </div>
              </div>
              
              <div class="col-md-4">
                <h6 class="fw-bold text-success">Docker Compose</h6>
                <div class="code-block">
                  <pre class="bg-light p-2 rounded text-sm">
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Scale service
docker-compose up -d --scale web=3

# Rebuild services
docker-compose up -d --build
                  </pre>
                </div>
              </div>
              
              <div class="col-md-4">
                <h6 class="fw-bold text-info">Kubernetes</h6>
                <div class="code-block">
                  <pre class="bg-light p-2 rounded text-sm">
# Get pods
kubectl get pods

# Describe pod
kubectl describe pod pod_name

# Apply manifest
kubectl apply -f deployment.yaml

# View logs
kubectl logs pod_name

# Port forward
kubectl port-forward pod_name 8080:80
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Community Section -->
    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">
              <i class="bi bi-people me-2"></i>
              Community & Forums
            </h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="https://forums.docker.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-chat-square-text me-2"></i>Docker Community Forums
                </a>
              </li>
              <li class="mb-2">
                <a href="https://reddit.com/r/docker" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-reddit me-2"></i>r/docker on Reddit
                </a>
              </li>
              <li class="mb-2">
                <a href="https://stackoverflow.com/questions/tagged/docker" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-stack-overflow me-2"></i>Docker on Stack Overflow
                </a>
              </li>
              <li class="mb-2">
                <a href="https://kubernetes.slack.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-slack me-2"></i>Kubernetes Slack
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">
              <i class="bi bi-cloud me-2"></i>
              Cloud Platforms
            </h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="https://aws.amazon.com/ecs/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-cloud me-2"></i>AWS ECS/EKS
                </a>
              </li>
              <li class="mb-2">
                <a href="https://azure.microsoft.com/en-us/services/container-instances/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-cloud me-2"></i>Azure Container Instances
                </a>
              </li>
              <li class="mb-2">
                <a href="https://cloud.google.com/kubernetes-engine" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-cloud me-2"></i>Google Kubernetes Engine
                </a>
              </li>
              <li class="mb-2">
                <a href="https://www.digitalocean.com/products/kubernetes/" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                  <i class="bi bi-cloud me-2"></i>DigitalOcean Kubernetes
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No reactive data needed for this static resources page
</script>

<style scoped>
.resources-view {
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.resource-section {
  border-left: 3px solid #e9ecef;
  padding-left: 1rem;
}

.code-block pre {
  background-color: var(--bs-secondary-bg) !important;
  font-size: 0.8rem;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}

.text-sm {
  font-size: 0.875rem;
}

a {
  color: #0d6efd;
  transition: color 0.15s ease-in-out;
}

a:hover {
  color: #0a58ca;
}

.list-unstyled li {
  padding: 0.25rem 0;
}

.card-header h5 {
  font-weight: 600;
}

.card-subtitle {
  font-style: italic;
}
</style>