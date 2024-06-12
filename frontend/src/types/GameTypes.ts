export interface Bullet {
    x: number;
    y: number;
    dy: number;
    origin: 'player' | 'enemy';
}

export interface Enemy {
    x: number;
    y: number;
    dx: number;
    dy: number;
    shootCounter: number;
}