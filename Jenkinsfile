pipeline {
  agent any

  environment {
    IMAGE = "devops-ecom-site"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Test') {
      steps {
        sh 'npm --version || true'
        sh 'node --version || true'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${IMAGE}:$BUILD_NUMBER ."
      }
    }

    stage('Deploy') {
      steps {
        sh """
          # stop and remove if exists
          docker rm -f ${IMAGE} || true
          # run latest image, map host 80 -> container 3000
          docker run -d --name ${IMAGE} -p 80:3000 ${IMAGE}:$BUILD_NUMBER
        """
      }
    }
  }

  post {
    success { echo "Deployed ${IMAGE}:$BUILD_NUMBER" }
    failure { echo "Build failed" }
  }
}
