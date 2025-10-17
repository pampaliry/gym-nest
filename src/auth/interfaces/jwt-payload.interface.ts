////jwt-payload.interface.ts
export interface JwtPayload {
  sub: number; // ID používateľa (subject)
  email: string; // email prihláseného používateľa
  role: string; // rola (member, trainer, admin)
  iat?: number; // issued at (automaticky)
  exp?: number; // expiration (automaticky)
}
