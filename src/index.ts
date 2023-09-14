import * as cdk from "aws-cdk-lib";
import { AuthenticationStack } from "./stacks/AuthenticationStack";
import { BackendStack } from "./stacks/BackendStack";
const app = new cdk.App();
const authenticationStack = new AuthenticationStack(app, "AuthenticationStack");
const databaseStack = new BackendStack(app, "DatabaseStack", { userPool: authenticationStack.userPool });
