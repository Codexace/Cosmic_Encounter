export enum Phase {
  START_TURN = 'START_TURN',
  REGROUP = 'REGROUP',
  DESTINY = 'DESTINY',
  LAUNCH = 'LAUNCH',
  ALLIANCE = 'ALLIANCE',
  PLANNING = 'PLANNING',
  REVEAL = 'REVEAL',
  RESOLUTION = 'RESOLUTION',
}

export enum PlayerColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  PURPLE = 'PURPLE',
}

export const ALL_PLAYER_COLORS: PlayerColor[] = [
  PlayerColor.RED,
  PlayerColor.BLUE,
  PlayerColor.GREEN,
  PlayerColor.YELLOW,
  PlayerColor.PURPLE,
];

export type PlayerId = string;
export type RoomId = string;
export type CardId = string;
