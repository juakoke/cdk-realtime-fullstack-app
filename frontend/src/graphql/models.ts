export interface Todo {
  id: number;
  name: string;
  description: string;
}
export interface OnCreateTodoResponse {
  onCreateTodo: Todo;
}
export interface ListTodosResponse {
  getTodos: {
    items: Todo[];
  };
}
