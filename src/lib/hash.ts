/**
 * Web Crypto API를 사용한 비밀번호 해싱 유틸리티
 * SHA-256 해시를 hex 문자열로 반환합니다.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 저장된 비밀번호가 해시 형식(64자 hex)인지 확인합니다.
 * SHA-256 해시는 항상 64자의 16진수 문자열입니다.
 */
export function isHashedPassword(password: string): boolean {
  return /^[a-f0-9]{64}$/.test(password);
}
