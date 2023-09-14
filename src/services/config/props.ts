import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export const lambdaCommonProps = {
  memorySize: 1024,
  timeout: Duration.minutes(3),
  runtime: Runtime.NODEJS_18_X,
  handler: "handler",
};
