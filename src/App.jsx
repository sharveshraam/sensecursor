import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import InfiniteCanvas from "./pages/InfiniteCanvas";
import PDFEditor from "./pages/PDFEditor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/board" element={<Board />} />
      <Route path="/canvas" element={<InfiniteCanvas />} />
      <Route path="/pdf" element={<PDFEditor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
