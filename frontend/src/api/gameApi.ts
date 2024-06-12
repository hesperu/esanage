import axios from 'axios';

const baseUrl = 'http://localhost:8080';

// スコアを送信する関数
export const submitScore = async (playerName  : string, score : number, playDate : string) => {
  try {
    const response = await axios.post(`${baseUrl}/submit_score`, {
      PlayerName: playerName,
      Score: score,
      PlayDate: playDate
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ランキングを取得する関数
export const getTopScores = async () => {
  try {
    const response = await axios.get(`${baseUrl}/top_scores`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
