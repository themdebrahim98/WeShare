import Main from "./components/Main";
import React, { useState } from "react";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline } from "@mui/material";

function App() {
  const [pageLoading, setPageLoading] = useState(true);
  setTimeout(() => {
    setPageLoading(false);
  }, 100);

  return (
    <div className="App">
      <CssBaseline />
      <Main />
    </div>
  );
}

export default App;
