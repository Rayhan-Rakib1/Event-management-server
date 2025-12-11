import { Role } from "@prisma/client"

export type IJwtPayload =  {
    name: string,
    email: string,
    role: Role
}