
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password,hash);
}

export function generateToken(userId: string): string {
    if(!process.env.JWT_SECRET){
        throw new Error("JWT_SECRET is undefined in it's environment variables");
    }
    return jwt.sign({userId}, process.env.JWT_SECRET,{ expiresIn: '7d' })

  }