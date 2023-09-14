import { useState, useEffect } from "react";
import { GraphQLQuery, GraphQLSubscription } from "@aws-amplify/api/lib-esm/types";
import { API } from "aws-amplify";
import { createMutation, listTodosQuery as getTodosQuery, onCreateTodoSubscription } from "@/graphql/operations";
import { ListTodosResponse as getTodosResponse, OnCreateTodoResponse, Todo } from "@/graphql/models";
import { API_REAL_TIME_ENDPOINT } from "@/config/enviroment";

export const useTodo = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<Partial<Todo>>();

  useEffect(() => {
    const requestFn = async () =>
      await API.graphql<GraphQLQuery<getTodosResponse>>({
        query: getTodosQuery,
        variables: {},
      });
    requestFn().then(({ data }) => (data ? setTodos(data.getTodos.items) : null));

    const sub = API.graphql<GraphQLSubscription<OnCreateTodoResponse>>(
      {
        query: onCreateTodoSubscription,
      },
      {
        endpoint: API_REAL_TIME_ENDPOINT,
      }
    ).subscribe({
      next: ({ value }) => {
        setTodos((prev) => [...prev, ...(value.data ? [value.data.onCreateTodo] : [])]);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  const createTodo = async () => {
    const res = await API.graphql<GraphQLQuery<getTodosResponse>>({
      query: createMutation,
      variables: {
        name: newTodo!.name,
        description: newTodo!.description,
      },
    });
    setNewTodo(undefined);
  };
  return { todos, createTodo, newTodo, setNewTodo };
};
