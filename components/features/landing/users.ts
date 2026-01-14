/**
 * 文件名: users.ts
 * 功能: 演示用静态用户数据。
 * 核心逻辑:
 * 1. 定义合法的用户名和密码映射。
 * 2. 导出用户名列表。
 */

export const VALID_USERS: Record<string, string> = {
  'ekko': 'ekko123',
  'link': 'link123',
  'admin': '123456'
};

export const USERNAMES = Object.keys(VALID_USERS);