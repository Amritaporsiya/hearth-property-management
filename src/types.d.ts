import 'express-session';
import type { Role } from './db.js';
declare module 'express-session' {
  interface SessionData { user?: { id: number; name: string; email: string; role: Role }; flash?: { type: string; message: string } }
}
