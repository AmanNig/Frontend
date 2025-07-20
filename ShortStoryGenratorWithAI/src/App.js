import './App.css';
import Leaderboard from './components/leaderboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Form from "./form";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
