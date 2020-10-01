import { ResponseHandler } from "./responseHandler"
import { Room } from "./schema"

export interface RepositoryHandler {
    setRoom(responseHandler: ResponseHandler, data: Room): void
    getRoom(roomId: number): Promise<Room>
}