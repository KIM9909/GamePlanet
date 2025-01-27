pipeline {
    agent any
    tools {
            nodejs 'nodejs-22'
     }
     environment {
            // 필요한 환경 변수 설정
            DOCKER_IMAGE_FRONT = "kimgon/meeple_front_image"
            DOCKER_IMAGE_BACK = "kimgon/meeple_back_image"
            DOCKER_IMAGE_NGINX = "kimgon/nginx_image"
            REGISTRY = "registry.hub.docker.com"
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
                withCredentials([file(credentialsId: 'app-config', variable: 'APP_CONFIG'), file(credentialsId: 'vite-config', variable: 'VITE_CONFIG')]) {

                    // 디렉토리 생성 및 파일 복사
                    sh 'mkdir -p meeple_back/src/main/resources'
                    sh 'cp $APP_CONFIG meeple_back/src/main/resources/application.yml'

                    // vite-config 파일 복사
                    sh 'cp $VITE_CONFIG meeple_front/vite.config.js'
                }
            }
        }

        stage('Build Frontend') {
             steps {
                    dir('meeple_front') {
                        sh 'npm install'
                        sh 'npm run build'
                    }
             }
        }

        stage('Build Backend') {
              steps {
                  dir('meeple_back') {
                      sh './gradlew build -x test' // Spring 프로젝트 빌드 명령어 (테스트 제외)
                  }
              }
        }


        stage('Build Docker Images') {
                    steps {
                        script {
                            // 프론트엔드 이미지 빌드
                            docker.build("${DOCKER_IMAGE_FRONT}", "./meeple_front")

                            // 백엔드 이미지 빌드
                            docker.build("${DOCKER_IMAGE_BACK}", "./meeple_back")

                            // Nginx 이미지 빌드
                            docker.build("${DOCKER_IMAGE_NGINX}", "./nginx")
                        }
                    }
                }

        stage('Push Docker Images') {
                    steps {
                        script {
                            docker.withRegistry("https://${REGISTRY}", 'docker-credentials') {
                                docker.image("${DOCKER_IMAGE_FRONT}").push("latest")
                                docker.image("${DOCKER_IMAGE_BACK}").push("latest")
                                docker.image("${DOCKER_IMAGE_NGINX}").push("latest")
                            }
                        }
                    }
                }

        stage('Deploy') {
                    steps {
                        // docker-compose 명령어를 Jenkins 워크스페이스 내에서 직접 실행
                        sh '''
                            docker-compose pull
                            docker-compose up -d --remove-orphans
                        '''
                    }
            }
    }

    post {
            always {
                cleanWs()
            }
    }
}