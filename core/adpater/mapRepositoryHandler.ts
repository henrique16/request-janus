import { RepositoryHandler } from "../interface/repositoryHandler"
import { ResponseHandler } from "../interface/responseHandler"
import { Room } from "../interface/schema"
import Redis from "ioredis"
import { resolve } from "path"

export class MapRepositoryHandler implements RepositoryHandler {
    private constroller: Map<number, Room>

    public constructor() {
        this.constroller = new Map<number, Room>()
    }

    public setRoom(responseHandler: ResponseHandler, data: Room): void {
        this.constroller.set(data.roomId, data)
        responseHandler.success()
    }

    public getRoom(roomId: number): Promise<Room> {
        const room = this.constroller.get(roomId)
        if (!room) return Promise.reject("there isn't roomId in repository")
        return Promise.resolve(room)
    }
}