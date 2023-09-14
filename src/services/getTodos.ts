import { getClient } from "./config/db";

export const handler = async (event: any) => {
  console.log("Funcionando bien");
  const { arguments: args } = event;
  const client = await getClient();
  await client.connect();
  const response = await client.query("SELECT * from todo");
  return { items: response.rows };
};
