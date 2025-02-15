import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  isTodoListLoading,
  todoEditingState,
  todoState,
  todoToEditState,
} from "../../contexts/TodoState";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Stack,
  TextField,
  outlinedInputClasses,
  styled,
  useTheme,
} from "@mui/material";

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "80%",
  [`${theme.breakpoints.down("md")}`]: {
    width: "100%",
  },
  [`${theme.breakpoints.up("md")}`]: {
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
  },
}));

const StyledStack = styled(Stack)(({ theme }) => ({
  [`${theme.breakpoints.down("md")}`]: {
    flexDirection: "column",
    alignItems: "center",
  },
}));

function AddTodo() {
  const [todo, setTodo] = useState("");
  const [error, setError] = useState(false);
  const [todos, setTodos] = useRecoilState(todoState);
  const [isEditing, setIsEditing] = useRecoilState(todoEditingState);
  const todoToEdit = useRecoilValue(todoToEditState);
  const setIsTodoListLoading = useSetRecoilState(isTodoListLoading);
  const [editTodo, setEditTodo] = useState("");
  const textFieldRef: React.Ref<HTMLInputElement> = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (isEditing) {
      setEditTodo(todoToEdit);
    }
  }, [isEditing, todoToEdit]);

  useEffect(() => {
    if (isEditing && editTodo === todoToEdit) {
      textFieldRef.current?.focus();
      textFieldRef.current?.select();
    }
  }, [editTodo, isEditing, todoToEdit]);

  const handleSubmitTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);

    if (isEditing) {
      const foundTodo = todos.find((todo) => todo.title === todoToEdit);
      if (foundTodo) {
        const newTodos = todos.map((todo) =>
          todo.id === foundTodo.id ? { ...todo, title: editTodo } : todo
        );
        setTodos(newTodos);
        setEditTodo("");
        setIsEditing(false);
      }
      return;
    }

    if (!todo) {
      setError(true);
      return;
    }
    setTodos((todos) => [
      ...todos,
      { id: crypto.randomUUID(), title: todo, isCompleted: false },
    ]);
    setTodo("");
  };

  useEffect(() => {
    const todosFromLocalStorage = JSON.parse(localStorage.getItem("todos") ?? "{}");
    if (Array.isArray(todosFromLocalStorage) && todosFromLocalStorage.length) {
      setIsTodoListLoading(true);
      setTodos(todosFromLocalStorage);
      setTimeout(() => {
        setIsTodoListLoading(false);
      }, 1500);
    }
  }, [setTodos, setIsTodoListLoading]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  return (
    <form style={{ width: "100%" }} onSubmit={handleSubmitTodo}>
      <StyledStack
        direction="row"
        alignItems="start"
        justifyContent="center"
        flexWrap="wrap"
        rowGap={2}
        mb={4}>
        <StyledTextField
          type="text"
          label="Write a todo..."
          variant="outlined"
          error={error}
          color={error ? "error" : "info"}
          helperText={error && "Empty input!"}
          value={isEditing ? editTodo : todo}
          onChange={(e) =>
            isEditing ? setEditTodo(e.target.value) : setTodo(e.target.value)
          }
          inputRef={textFieldRef}
        />

        <Button
          type="submit"
          variant="contained"
          color="info"
          sx={{
            padding: "1rem 3rem",
            [`${theme.breakpoints.up("md")}`]: {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
          }}>
          {isEditing ? "Save Todo" : "Add Todo"}
        </Button>
      </StyledStack>
    </form>
  );
}

export default AddTodo;
