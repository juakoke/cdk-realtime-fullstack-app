import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { Client } from "pg";
export const getClient = async () => {
  const credentials = await getCredentials();
  console.log({ credentials });
  return new Client({
    user: credentials.username,
    host: credentials.host,
    database: credentials.dbname,
    password: credentials.password,
    port: credentials.port,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};
const getCredentials = async () => {
  const SecretId = process.env.DB_SECRET_ARN;
  const secretManager = new SecretsManager();
  const secret = await secretManager.getSecretValue({ SecretId });
  return JSON.parse(secret.SecretString ?? "{}");
};
