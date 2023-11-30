# Welcome to your CDK Serverless FullStack project

This is a Serverles FullStack project for CDK development with TypeScript.

## Dependencies

- Node = 18.15.0
- AWS cdk = 2.96.2
- AWS CLI
- IAM credentials with administrator access

## Description

FullStack serverless real-time aplication using AppSync, Lambda Functions, RDS and Cognito.
The frontend could be mounted on Amplify.

## Steps

- On AWS console create ec2 key pair called "miKey"
- `cdk deploy --all --profile [aws-profile]` deploy all resources to AWS.
- create `.env.local` on frontend directory with correct values. You can find the enviroment variables that you need to set on `frontend/src/config/enviroment.ts`
- Restore Database from `database.dump`
- ¡Run frontend with `yarn dev` and start receiving and sending Todos!

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
