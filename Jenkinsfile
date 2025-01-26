pipeline {
    agent any

    environment {
        // Docker 이미지 이름 및 태그
        IMAGE_NAME = "meeple-backend"
        IMAGE_TAG = "${env.BUILD_NUMBER}"  // 빌드 번호를 태그로 사용
        CONTAINER_NAME = "meeple-backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop',
                    credentialsId: 'gitlab-token',
                    url: 'https://lab.ssafy.com/s12-webmobile1-sub1/S12P11C109.git'
            }
        }

        stage('Build & Test') {
            steps {
                dir('meeple_back') {
                    sh "./gradlew clean build"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dir('meeple_back') {
                        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh """
                        if [ \$(docker ps -q -f name=${CONTAINER_NAME}) ]; then
                            docker rm -f ${CONTAINER_NAME}
                        fi
                    """

                    sh """
                        docker run -d --name ${CONTAINER_NAME} -p 8090:8080 ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}