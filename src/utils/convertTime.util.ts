const SECOND = 1000
const MINUTE = 60 * SECOND
const DAY = 24 * 60 * MINUTE

export const COOKIE_TIME = {
  ACCESS: 5 * MINUTE, // 5 минут
  REFRESH: 7 * DAY, // 7 дней
}

export const JWT_TIME = {
  ACCESS: '5m',
  REFRESH: '7d',
}
