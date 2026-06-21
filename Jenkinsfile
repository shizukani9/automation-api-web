pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    environment {
        CI = 'true'
        BASE_URL_FRONT = 'https://automationexercise.com'
        BASE_URL_BACK = 'http://localhost:5002'
    }
    
    stages {
        stage('📦 Setup') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                sh 'npm ci'
                sh 'npx playwright install --with-deps chromium'
            }
        }
        
        stage('🌐 Web Tests') {
            steps {
                sh 'npm run test:web'
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'reports/playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report',
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: false
                    ])
                    junit 'reports/junit.xml'
                }
            }
        }
        
        stage('📊 Archivar') {
            steps {
                archiveArtifacts artifacts: 'reports/**/*'
            }
        }
    }
    
    post {
        always {
            sh 'npm run clean || true'
        }
        success { echo '✅ Éxito!' }
        failure { echo '❌ Falló!' }
    }
}