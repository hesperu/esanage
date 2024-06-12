import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StartScreen from './components/StartScreen'; 
import GameScreen from './components/GameScreen';
import NameInputScreen from './components/NameInputScreen';
import RankingSceen from './components/RankingScreen';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/game" element={<GameScreen/>} />
        <Route path="/name_input" element={<NameInputScreen/>} />
        <Route path="/ranking" element={<RankingSceen/>} />
      </Routes>
    </Router>
  );
}

export default App;
