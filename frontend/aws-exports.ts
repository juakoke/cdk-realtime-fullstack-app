import {
  API_GRAPHQL_ENDPOINT,
  AWS_REGION,
  COGNITO_IDENTITYPOOL_ID,
  COGNITO_USERPOOL_ID,
  COGNITO_USERPOOL_WEBCLIENT_ID,
} from "@/config/enviroment";

const awsConfig = {
  Auth: {
    region: AWS_REGION,
    userPoolId: COGNITO_USERPOOL_ID,
    userPoolWebClientId: COGNITO_USERPOOL_WEBCLIENT_ID,
    identityPoolId: COGNITO_IDENTITYPOOL_ID,
  },
  aws_appsync_graphqlEndpoint: API_GRAPHQL_ENDPOINT,
  aws_appsync_region: AWS_REGION,
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
};

export default awsConfig;
