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
                    script {
                        runCmd('npm ci')
                        runCmd('npm run test')
                    }
                }
            }
        }

        stage('Frontend - Install & Build') {
            steps {
                dir('frontend') {
                    script {
                        runCmd('npm ci')
                        runCmd('npm run build')
                    }
                }
            }
        }

        stage('Docker - Build Images') {
            steps {
                script {
                    runCmd('docker build -t promanage-backend:latest ./backend')
                    runCmd('docker build -t promanage-frontend:latest ./frontend')
                }
            }
        }

        stage('Local Deploy') {
            steps {
                script {
                    try {
                        runCmd('docker compose down --remove-orphans')
                    } catch (Exception e) {
                        echo "Ignored docker compose down failure: ${e.getMessage()}"
                    }
                    runCmd('docker compose up -d')
                }
            }
        }
    }

    post {
        always {
            // Clean workspace to free up server storage
            cleanWs()
        }
        success {
            echo '🎉 ProManage CI/CD Pipeline successfully executed!'
        }
        failure {
            echo '❌ Jenkins Pipeline failed. Please inspect the stage logs.'
        }
    }
}

def runCmd(cmd) {
    if (isUnix()) {
        sh cmd
    } else {
        bat cmd
    }
}
