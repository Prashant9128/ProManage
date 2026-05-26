pipeline {
    agent any

    environment {
        JWT_SECRET = 'promanage_super_secret_key_2026'
        JWT_EXPIRE = '7d'
        NODE_ENV = 'development'
    }

    stages {
        stage('Checkout') {
            steps {
                // Pull source code from Git repository
                checkout scm
            }
        }

        stage('Backend - Install & Test') {
            steps {
                dir('backend') {
                    // Install backend dependencies and run API tests
                    sh 'npm ci'
                    sh 'npm run test'
                }
            }
        }

        stage('Frontend - Install & Build') {
            steps {
                dir('frontend') {
                    // Install frontend dependencies and build Vite static assets
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker - Build Images') {
            steps {
                // Build Docker images for both backend and frontend microservices
                sh 'docker build -t promanage-backend:latest ./backend'
                sh 'docker build -t promanage-frontend:latest ./frontend'
            }
        }

        stage('Local Deploy') {
            steps {
                // Restart containers with Docker Compose to deploy the changes
                sh 'docker compose down --remove-orphans || true'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        always {
            // Clean workspace to free up server storage
            cleanWs()
        }
        success {
            echo '🎉 ProManage CI/CD Pipeline successfully executed on Jenkins!'
        }
        failure {
            echo '❌ Jenkins Pipeline failed. Please inspect the stage logs.'
        }
    }
}
