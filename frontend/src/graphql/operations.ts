export const createMutation = /* GraphQL */ `
  mutation MyMutation($name: String = "", $description: String = "") {
    createTodo(description: $description, name: $name) {
      id
      name
      description
    }
  }
`;
export const onCreateTodoSubscription = /* GraphQL */ `
  subscription MySubscription {
    onCreateTodo {
      id
      name
      description
    }
  }
`;
export const listTodosQuery = /* GraphQL */ `
  query MyQuery {
    getTodos {
      items {
        id
        name
        description
      }
    }
  }
`;
