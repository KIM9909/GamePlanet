pipeline {
    agent any

    environment {
        IMAGE_NAME = "meeple"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = "meeple-app"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop',
                    credentialsId: 'gitlab-token',
                    url: 'https://lab.ssafy.com/s12-webmobile1-sub1/S12P11C109.git'
            }
        }

        stage('Prepare Config') {
            steps {
                    withCredentials([file(credentialsId: 'app-config', variable: 'APP_CONFIG')]) {
                        // 현재 작업 디렉토리 확인
                        sh 'pwd'
                        sh 'ls -la'

                        // 디렉토리 생성 및 파일 복사
                        sh 'mkdir -p meeple_back/src/main/resources'
                        sh 'cp $APP_CONFIG meeple_back/src/main/resources/application.yml'

                        // 복사된 파일 확인
                        sh 'ls -la meeple_back/src/main/resources/'
                        // 민감 정보가 포함된 경우 아래 명령어는 주석 처리
                        // sh 'cat meeple_back/src/main/resources/application.yml'
                    }
                }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dir('meeple_back') {
                        // Docker 이미지를 빌드
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