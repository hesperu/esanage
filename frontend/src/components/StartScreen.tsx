import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartScreen: React.FC = () => {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/name_input');
  };

  return (
    <div className="start_screen">
      <h1 className="title_text">エサなげ</h1>
      <button className="btn" onClick={startGame}>
        ゲームスタート
      </button>
    </div>
  );
};

export default StartScreen;
