#!/bin/bash

# Docker Web Desktop - Deployment Script

set -e

echo "🐳 Docker Web Desktop - Deployment Script"
echo "==========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the application in production mode"
    echo "  dev       Start the application in development mode"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      Show application logs"
    echo "  clean     Stop and remove all containers, networks, and volumes"
    echo "  build     Build all Docker images"
    echo "  status    Show status of all containers"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 dev"
    echo "  $0 logs"
}

# Parse command
COMMAND=${1:-"start"}

case $COMMAND in
    "start")
        echo "🚀 Starting Docker Web Desktop in production mode..."
        docker-compose up -d --build
        echo "✅ Application started successfully!"
        echo "🌐 Frontend: http://localhost"
        echo "🔧 Backend API: http://localhost:3000"
        ;;
        
    "dev")
        echo "🚀 Starting Docker Web Desktop in development mode..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
        
    "stop")
        echo "🛑 Stopping Docker Web Desktop..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        echo "✅ Application stopped successfully!"
        ;;
        
    "restart")
        echo "🔄 Restarting Docker Web Desktop..."
        docker-compose down
        docker-compose up -d --build
        echo "✅ Application restarted successfully!"
        ;;
        
    "logs")
        echo "📋 Showing application logs..."
        docker-compose logs -f
        ;;
        
    "clean")
        echo "🧹 Cleaning up Docker Web Desktop..."
        docker-compose down -v --rmi all --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans 2>/dev/null || true
        echo "✅ Cleanup completed!"
        ;;
        
    "build")
        echo "🔨 Building Docker images..."
        docker-compose build --no-cache
        echo "✅ Images built successfully!"
        ;;
        
    "status")
        echo "📊 Container status:"
        docker-compose ps
        echo ""
        echo "📊 Development container status:"
        docker-compose -f docker-compose.dev.yml ps 2>/dev/null || echo "No development containers running"
        ;;
        
    "help"|"-h"|"--help")
        show_usage
        ;;
        
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        show_usage
        exit 1
        ;;
esac