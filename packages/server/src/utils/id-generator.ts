const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I or O to avoid confusion
const ROOM_CODE_LENGTH = 4;

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}
