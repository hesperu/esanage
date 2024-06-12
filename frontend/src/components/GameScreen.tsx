import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FontFaceObserver from 'fontfaceobserver';
import { submitScore } from '../api/gameApi';
import { Bullet, Enemy } from '../types/GameTypes';
import enemyImagePath from "../img/enemy.png";
import bulletImagePath from "../img/bullet.png";
import playerImagePath from "../img/player.png";
import enemyBulletImagePath from "../img/enemyBullet.png";

const PLAYER_INITIAL_X = 400;
const PLAYER_Y = 550;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const BULLET_WIDTH = 20;
const BULLET_HEIGHT = 20;
const ENEMY_RADIUS = 50;
const BULLET_MOVEMENT_SPEED = 10;
const PLAYER_MOVEMENT_SPEED = 10;
const ENEMY_MOVEMENT_SPEED = 4;
const ENEMY_BULLET_SPEED = 4;
const LEFT_BOUND = 20;
const RIGHT_BOUND = 780;
const ENEMY_AREA_BOUND = 200;
const SCORE_LEFT = 30;
const SCORE_TOP = 20;
const SCORE_POINT = 100;
const COMBO_RATIO = 1.1;

const font = new FontFaceObserver('DotGothic16');
font.load();

const GameScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerName, setPlayerName] = useState<string | null>(null); //プレイヤーの名前
  const playerNameRef = useRef<string | null>(null); // playerNameRefを追加
  let playerX = PLAYER_INITIAL_X; // プレイヤーの初期位置
  let requestId: number | undefined;
  const bullets: Bullet[] = []; // 弾丸を格納する配列
  const enemies: Enemy[] = []; //敵
  let score = 0; 
  let comboCounter = 0; //スコアのカウンター
  let lastHitBulletNum = -1; //最後にヒットした弾丸の番号
  let lastBulletNum = -1; //最後に撃った弾丸の番号
  let enemyNum = 5; //敵数
  let isGameOver = false; //ゲームオーバーの状態
  const navigate = useNavigate();
  const enemyImage = new Image();
  const bulletImage = new Image();
  const playerImage = new Image();
  const enemyBulletImage = new Image();
  enemyImage.src = enemyImagePath;
  bulletImage.src = bulletImagePath;
  playerImage.src = playerImagePath;
  enemyBulletImage.src = enemyBulletImagePath;

  //移動キー入力の管理
  const keyMap: { [key: string]: boolean } = useRef({
    ArrowLeft: false,
    ArrowRight: false
  }).current;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const name = localStorage.getItem('playerName');
    if (name) {
      setPlayerName(name);
      playerNameRef.current = name; // playerNameRefを更新
    } else {
      const defaultName = 'Unknown Player';
      setPlayerName(defaultName);
      playerNameRef.current = defaultName; // playerNameRefを更新
    }
    enemies.push(...generateEnemies(enemyNum)); // 初期の敵を生成

    if (ctx) {
      Promise.all([
        loadImage(enemyImage),
        loadImage(bulletImage),
        loadImage(playerImage),
        loadImage(enemyBulletImage)
      ]).then(() => {
        // 画像の読み込みが完了したらゲームを開始
        ctx.strokeStyle = 'white'; // 色を設定
        drawInitialState(ctx); // 初期状態を描画
        startGame(ctx);
      }).catch(err => {
        console.error('画像の読み込みに失敗しました', err);
      });
    }
  }, []); 

  const loadImage = (image: HTMLImageElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Failed to load image ${image.src}`));
    });
  };

  const drawInitialState = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPlayer(ctx, playerX, PLAYER_Y);
    drawEnemies(ctx);
    drawScore(ctx);
  };

  const startGame = (ctx: CanvasRenderingContext2D) => {
    const gameLoop = () => {
      update(ctx); // 状態の更新
      draw(ctx); // 描画
      requestId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (isGameOver) {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 背景を黒で塗りつぶす
      ctx.font = '40px DotGothic16';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', ctx.canvas.width / 2, ctx.canvas.height / 2); // 中央にゲームオーバーを表示
    } else {
      // 通常のゲーム描画
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // 矩形の枠線を描画
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawPlayer(ctx, playerX, PLAYER_Y);
      drawBullets(ctx);
      drawEnemies(ctx);
      drawScore(ctx);
    }
  };

  const stopGame = () => {
    if (requestId) {
      cancelAnimationFrame(requestId);
    }
  };

  const update = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // キャンバスをクリア
    moveBullets(); // 弾丸の位置を更新
    moveEnemies();
    movePlayer();
    draw(ctx);
    checkCollisions();

    if (enemies.length === 0) {
      enemies.push(...generateEnemies(enemyNum)); // 敵がいなくなったら新たに5体の敵を生成
    }

    if (!isGameOver){
      checkGameOver();
    }
  };

  const moveRankingScreen = () => {
    navigate('/ranking');
  };

  const checkGameOver = () => {
    bullets.forEach(bullet => {
      if (bullet.origin === "enemy" && bullet.x >= playerX - PLAYER_WIDTH / 2 && bullet.x <= playerX + PLAYER_WIDTH / 2
            && bullet.y >= PLAYER_Y - PLAYER_HEIGHT / 2 && bullet.y <= PLAYER_Y + PLAYER_HEIGHT){
        isGameOver = true;
        stopGame();
        const name = playerNameRef.current;

        if (name){
          submitScore(name, score, new Date().toISOString().replace('T', ' ').substring(0, 19))
            .then(data => console.log('Score submitted:', data))
            .catch(error => console.error('Failed to submit score:', error));
          localStorage.setItem('playerScore', score.toString());
        }
        setTimeout(() => {
          moveRankingScreen();
        }, 3000);
      }
    })
  }

  // 敵画像のアスペクト比を計算
  const enemyAspectRatio = enemyImage.width / enemyImage.height;
  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    let targetWidth = ENEMY_RADIUS * 2;
    let targetHeight = targetWidth / enemyAspectRatio;

    // 縦方向に合わせてリサイズ
    if (targetHeight > ENEMY_RADIUS * 2) {
      targetHeight = ENEMY_RADIUS * 2;
      targetWidth = targetHeight * enemyAspectRatio;
    }

    enemies.forEach(enemy => {
      ctx.drawImage(enemyImage, enemy.x - targetWidth / 2, enemy.y - targetHeight / 2, targetWidth, targetHeight);
    });
  };

  const moveBullets = () => {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.y += bullet.dy;
      // 画面外に出た弾丸を配列から削除
      if (bullet.y < 0 || bullet.y > CANVAS_HEIGHT) {
        bullets.splice(i, 1);
      }
    }
  };

  // 弾丸画像のアスペクト比を計算
  const bulletAspectRatio = bulletImage.width / bulletImage.height;
  const enemyBulletRatio = enemyBulletImage.width / enemyBulletImage.height;
  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    let bulletTargetWidth = BULLET_WIDTH * 2;
    let bulletTargetHeight = bulletTargetWidth / bulletAspectRatio;
    let enemyBulletTargetWidth = BULLET_WIDTH * 2;
    let enemyBulletTargetHeight = enemyBulletTargetWidth / enemyBulletRatio;

    // 縦方向に合わせてリサイズ
    if (bulletTargetWidth > BULLET_HEIGHT * 2) {
      bulletTargetHeight = BULLET_HEIGHT * 2;
      bulletTargetWidth = bulletTargetHeight * bulletAspectRatio;
    }

    if (enemyBulletTargetWidth > BULLET_HEIGHT * 2) {
      enemyBulletTargetHeight = BULLET_HEIGHT * 2;
      enemyBulletTargetWidth = enemyBulletTargetHeight * bulletAspectRatio;
    }

    bullets.forEach(bullet => {
      if (bullet.origin === "enemy"){
        ctx.drawImage(enemyBulletImage, bullet.x - enemyBulletTargetWidth / 2, 
          bullet.y - enemyBulletTargetHeight / 2, enemyBulletTargetWidth, enemyBulletTargetHeight);
      }
      else {
        ctx.drawImage(bulletImage, bullet.x - bulletTargetWidth / 2, 
          bullet.y - bulletTargetHeight / 2, bulletTargetWidth, bulletTargetHeight);
      }
    });
  };

  //射撃との衝突判定をして弾丸を削除する
  const checkCollisions = () => {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      for (let j = bullets.length - 1; j >= 0; j--) {
        const bullet = bullets[j];
        if (bullet.origin === 'player') {
          if (Math.abs(bullet.x - enemy.x) < ENEMY_RADIUS && Math.abs(bullet.y - enemy.y) < ENEMY_RADIUS) {
            if (lastHitBulletNum === lastBulletNum - 1) { // 最後に発射した弾丸番号と今の発射した番号が続いている
              comboCounter += 1;
            } else {
              comboCounter = 1; // 連続ヒットが途切れた場合
            }
            lastHitBulletNum = lastBulletNum;
            score += Math.round(SCORE_POINT * Math.pow(COMBO_RATIO, comboCounter - 1)); // 連続ヒットによるポイント増加
  
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            break;
          }
        }
      }
    }
  };

  const drawScore = (ctx: CanvasRenderingContext2D) => {
    ctx.font = '16px DotGothic16';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, SCORE_LEFT, SCORE_TOP); // スコアを左上に表示  
  }
  
  //敵の生成
  const generateEnemies = (num: number): Enemy[] => {
    return Array.from({ length: num }, () => ({
      x: Math.random() * RIGHT_BOUND,
      y: Math.random() * ENEMY_AREA_BOUND,
      dx: (Math.random() - 0.5) * ENEMY_MOVEMENT_SPEED,
      dy: (Math.random() - 0.5) * ENEMY_MOVEMENT_SPEED,
      shootCounter: Math.floor(Math.random() * 180) + 60
    }));
  }
  
  
  const moveEnemies = () => {
    enemies.forEach(enemy => {
      enemy.x += enemy.dx;
      enemy.y += enemy.dy;

      // 画面端で跳ね返るようにする
      if (enemy.x < 0 || enemy.x > RIGHT_BOUND) enemy.dx *= -1;
      if (enemy.y < 0 || enemy.y > ENEMY_AREA_BOUND) enemy.dy *= -1;

      // 敵の射撃カウンターを減少させ、0になったら射撃
      if (--enemy.shootCounter <= 0) {
        bullets.push({ x: enemy.x, y: enemy.y + ENEMY_RADIUS, dy: ENEMY_BULLET_SPEED, origin: 'enemy' }); // 下方向に弾丸を発射
        enemy.shootCounter = Math.floor(Math.random() * 180) + 60; // 射撃間隔をリセット
      }
    });
  };

  const movePlayer = () => {
    if (keyMap['ArrowLeft']) playerX = Math.max(playerX - PLAYER_MOVEMENT_SPEED, LEFT_BOUND);
    if (keyMap['ArrowRight']) playerX = Math.min(playerX + PLAYER_MOVEMENT_SPEED, RIGHT_BOUND);
  };

  const playerAspectRatio = playerImage.width / playerImage.height;
  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    let targetWidth = PLAYER_WIDTH * 2;
    let targetHeight = targetWidth / playerAspectRatio;
    if (targetHeight > PLAYER_HEIGHT * 2) {
      targetHeight = PLAYER_HEIGHT * 2;
      targetWidth = targetHeight * playerAspectRatio;
    }
    
    ctx.drawImage(playerImage, x - targetWidth / 2, y - targetHeight / 2, targetWidth, targetHeight);
   }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key in keyMap) {
      keyMap[event.key] = true;
    }
    if (event.key === ' ') {  // スペースキーが押された時の処理を追加
      bullets.push({ x: playerX, y: PLAYER_Y - BULLET_HEIGHT, dy: -BULLET_MOVEMENT_SPEED, origin: 'player' });  // 上方向に弾丸を発射
      lastBulletNum++;
    }  
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key in keyMap) {
      keyMap[event.key] = false;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="game_screen">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} tabIndex={0}></canvas>;
    </div>
  );
};

export default GameScreen;
