import { Expose } from 'class-transformer'

export class UserResponseDto {
    @Expose()
    id: string

    @Expose()
    email: string
    
    @Expose()
    username: string

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
