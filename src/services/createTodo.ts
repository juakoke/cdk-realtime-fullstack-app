import { getClient } from "./config/db";

export const handler = async (event: {
  arguments: { name: string; description: string };
}) => {
  const {
    arguments: { name, description },
  } = event;
  try {
    const client = await getClient();
    await client.connect();
    const response = await client.query(`
    INSERT INTO todo (name, description)
            values('${name}', '${description}') 
    RETURNING *
  `);

    return response.rows[0];
  } catch (error) {
    console.log(error);
    throw Error;
  }
};
