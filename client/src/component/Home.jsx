import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is required");
      return;
    }

    navigate(`editor/${roomId}`, {
      state: { username },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#1c1e29",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          width: 410,
          backgroundColor: "#1f2937",
          borderRadius: 2,
          color: "#fff",
        }}
      >
        <Box textAlign="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
            CodeVerse
          </Typography>
        </Box>

        <Typography
          variant="subtitle1"
          textAlign="center"
          sx={{ mb: 3, fontWeight: "medium" }}
        >
          Enter the Room Id
        </Typography>

        <form>
          <Stack spacing={2}>
            <TextField
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              fullWidth
              label="Room Id"
              variant="filled"
              slotProps={{
                inputLabel: {
                  sx: {
                    "&.Mui-focused": {
                      color: "#5D5D5D", // Color when focused (e.g., green)
                    },
                  },
                },
              }}
              sx={{
                input: { color: "#000" },
                backgroundColor: "#fff",
                borderRadius: 1,
                width: "40ch",
                outline: "none",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "transparent",
                  },
                },
              }}
              required
            />

            <TextField
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              variant="filled"
              label="Username"
              slotProps={{
                inputLabel: {
                  sx: {
                    "&.Mui-focused": {
                      color: "#5D5D5D", // Color when focused (e.g., green)
                    },
                  },
                },
              }}
              sx={{
                input: { color: "#000" },
                backgroundColor: "#fff",
                borderRadius: 1,
                width: "40ch",
              }}
              required
            />

            <Button
              onClick={joinRoom}
              variant="contained"
              color="success"
              fullWidth
              sx={{ fontWeight: "bold", py: 1 }}
            >
              JOIN
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don’t have a room Id?{" "}
          <Link
            onClick={generateRoomId}
            underline="hover"
            style={{ color: "green", textDecoration: "none" }}
          >
            New Room
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Home;
