import { getClient } from "./config/db";

export const handler = async (event: any) => {
  console.log("Funcionando bien");
  const { arguments: args } = event;
  try {
    const client = await getClient();
    await client.connect();
    const response = await client.query(
      `SELECT * from todo where id = ${args.id}`
    );
    return response.rows[0];
  } catch (error) {
    console.log(error);
    throw Error;
  }
};
