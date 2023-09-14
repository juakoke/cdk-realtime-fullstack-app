"use client";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTodo } from "@/hooks/useTodo";
import SendIcon from "@mui/icons-material/Send";

const Home = () => {
  const { todos, createTodo, newTodo, setNewTodo } = useTodo();

  const columns: GridColDef[] = [
    { field: "id", headerName: "id", flex: 1 },
    { field: "name", headerName: "name", flex: 5 },
    { field: "description", headerName: "Descripción", flex: 5 },
  ];

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h2">Todo List</Typography>
      <Divider />
      {todos && (
        <Box sx={{ width: "80%", background: "rgba(255,255,255, 0.8)" }}>
          <DataGrid
            autoHeight={true}
            rows={todos.map(({ id, name, description }) => ({
              id,
              name,
              description,
            }))}
            columns={columns}
            showColumnVerticalBorder={true}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 100 },
              },
            }}
            pageSizeOptions={[100, 150]}
            checkboxSelection
          />
        </Box>
      )}
      <Box display={"flex"} flexDirection={"column"} alignItems={"center"} gap={"8px"} minWidth={"300px"} width={"80%"}>
        <Typography variant="h2">New Todo</Typography>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: "8px",
          }}
        >
          <TextField
            placeholder="name"
            value={newTodo?.name ?? ""}
            onChange={({ target }) => setNewTodo((prev) => ({ ...(prev ?? {}), name: target.value }))}
            fullWidth={true}
          />
          <TextField
            placeholder="description"
            value={newTodo?.description ?? ""}
            onChange={({ target }) =>
              setNewTodo((prev) => ({
                ...(prev ?? {}),
                description: target.value,
              }))
            }
            fullWidth={true}
          />
        </Box>
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          fullWidth={true}
          disabled={!Boolean(newTodo?.name && newTodo?.description)}
          onClick={() => createTodo()}
        >
          Create
        </Button>
      </Box>
    </main>
  );
};
export default Home;
