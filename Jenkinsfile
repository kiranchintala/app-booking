pipeline {
  agent any

  parameters {
    choice(name: 'TARGET_ENV', choices: ['dev', 'prod'], description: 'Select deployment environment')
  }

  environment {
    AWS_REGION = 'us-east-1'
    S3_BUCKET = 'your-microapp-bucket'
    APP_NAME = 'app-booking'
  }

  tools {
    nodejs 'node18'
  }

  stages {
    stage('Inject .env') {
      steps {
        withCredentials([string(credentialsId: "env-${params.TARGET_ENV}-vars", variable: 'ENV_VARS')]) {
          writeFile file: ".env", text: "${ENV_VARS}"
        }
      }
    }

    stage('Install & Build') {
      steps {
        sh 'npm install --legacy-peer-deps'
        sh 'npm run build --mode ${params.TARGET_ENV}'
      }
    }

    stage('Deploy to S3') {
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: 'aws-creds'
        ]]) {
          sh 'aws s3 sync dist/ s3://$S3_BUCKET/$APP_NAME/ --delete --region $AWS_REGION'
        }
      }
    }
  }

  post {
    success {
      echo "✅ $APP_NAME deployed successfully to ${params.TARGET_ENV}"
    }
    failure {
      echo "❌ Deployment failed."
    }
  }
}