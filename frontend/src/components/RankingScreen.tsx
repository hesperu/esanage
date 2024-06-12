import React, { useEffect, useState } from 'react';
import { getTopScores } from '../api/gameApi';
import { useNavigate } from 'react-router-dom';

interface Score {
    PlayerName: string;
    Score: number;
    PlayDate: string;
}
  
const RankingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<Score[]>([]);

  const handleGameClick = () => {
    navigate('/game');
  };

  const handleTitleClick = () => {
    navigate('/');
  };

  const handleTwitterClick = () => {
    const name = localStorage.getItem('playerName');
    const score = localStorage.getItem('playerScore');
    console.log(score);
    const text = "エサなげで" + score + "点" + "記録しました"; 
    const shareText = encodeURIComponent(text);
    const url = encodeURIComponent("https://example.com");
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`;  
    if (name && score){
      window.open(twitterShareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    getTopScores()
      .then(data => setScores(data))
      .catch(error => console.error('Failed to fetch scores:', error));
  }, []);

  return (
    <div className='ranking_screen'>
      <div className="ranking_top_container">
        <h1 className="ranking_title_text">Top Scores</h1>
      </div>
      <div className="ranking_text_container">
        {scores.map((score, index) => (
          <p key={index} className='ranking_text'>
            {index + 1}. {score.PlayerName}: {score.Score} date: {score.PlayDate}
          </p>
        ))}
      </div>
      <div className='ranking_button_container'>
        <button className='btn' onClick={handleGameClick}>
          もういっかいやる
        </button>
        <button className='btn' onClick={handleTitleClick}>
          タイトルにもどる
        </button>
        <button className='btn' onClick={handleTwitterClick}>
          <i className="fab fa-twitter"></i>
        </button>
      </div>
    </div>
  );
};

export default RankingScreen;
