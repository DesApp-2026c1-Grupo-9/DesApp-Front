import React from "react";
import { Box, Stack } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { TopMenu } from "./components/TopMenu";
import { AppRouter } from "./AppRouter";

export function App() {
  return (
    <BrowserRouter>
      <Stack direction='column'>
        <TopMenu />
        <Box sx={{mx: { xs: 1, md: 4 }, my: 4}}>
          <AppRouter />
        </Box>
      </Stack>
    </BrowserRouter>
  )
}
