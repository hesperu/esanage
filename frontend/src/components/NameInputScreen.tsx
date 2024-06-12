import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NameInputScreen: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 名前を保存する
    localStorage.setItem('playerName', name);
    // ゲーム画面へ遷移
    navigate('/game');
  };

  return (
    <div className="name_input_screen">
      <h1 className="title_text">名前をにゅうりょくしてね</h1>
      <form className="name_input_form" onSubmit={handleSubmit}>
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
        />
        <button className="btn" type="submit">ゲーム開始</button>
      </form>
    </div>
  );
};

export default NameInputScreen;
