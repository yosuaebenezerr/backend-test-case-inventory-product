import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface IJWTPayloadType extends JwtPayload {
      id: string;
      username: string;
      name: string;
      email: string | null;
      userType: string;
    }

    interface Request {
      user?: IJWTPayloadType;
    }
  }
}
