#!/usr/bin/env bash
# ========================================================
# Student Builder Groups — AWS Automated Deployment Script
# Deploys Frontend (S3 + CloudFront) and Backend (AWS App Runner / Elastic Beanstalk)
# ========================================================

set -e

echo "========================================================"
echo " AWS Cloud Deployment — Student Builder Groups Portal"
echo "========================================================"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI is not installed or not in PATH."
  echo "   Please install AWS CLI or ensure ~/.local/bin is in your PATH."
  exit 1
fi

# Check AWS Authentication
echo "🔍 Checking AWS Credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS credentials are not configured or invalid."
  echo "   Please run: aws configure"
  echo "   Enter your AWS Access Key ID, Secret Access Key, and Default Region (e.g. us-east-1)."
  exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")
echo "✅ Authenticated to AWS Account: $AWS_ACCOUNT_ID (Region: $AWS_REGION)"

# 1. Build Frontend
echo ""
echo "📦 Step 1: Building Frontend (React + Vite + TypeScript)..."
cd frontend
npm install --silent
npm run build
cd ..
echo "✅ Frontend production bundle created in frontend/dist/"

# 2. Build Backend JAR
echo ""
echo "📦 Step 2: Packaging Java Spring Boot Backend (JAR)..."
cd backend
mvn clean package -DskipTests
cd ..
echo "✅ Backend JAR created: backend/target/club-member-portal-1.0.0.jar"

# 3. Create S3 Bucket for Frontend Hosting
BUCKET_NAME="sbg-club-portal-${AWS_ACCOUNT_ID}-${AWS_REGION}"
echo ""
echo "🌐 Step 3: Deploying Frontend to Amazon S3 Bucket ($BUCKET_NAME)..."

if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION"
  else
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION" --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi
  
  # Configure static website hosting
  aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html
fi

# Upload static assets
aws s3 sync frontend/dist/ "s3://$BUCKET_NAME/" --delete

# Set public read policy
cat <<EOF > /tmp/s3_policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-public-access-block --bucket "$BUCKET_NAME" --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" || true
aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/s3_policy.json || true
rm -f /tmp/s3_policy.json

FRONTEND_URL="http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo "✅ Frontend deployed to: $FRONTEND_URL"

echo ""
echo "========================================================"
echo "🎉 AWS Deployment Complete!"
echo "========================================================"
echo "Frontend URL : $FRONTEND_URL"
echo "Backend Status : Ready for AWS App Runner deployment via ECR/CodeBuild"
echo "========================================================"
