import { CreateRoomResponse } from "./interface/createRoomResponse"
import { RequestHandler } from "./interface/requestHandler"

export class CreateRoom {
    private createRoomResponse: CreateRoomResponse
    private requestHandler: RequestHandler
    private roomId: number

    public constructor(
        requestHandler: RequestHandler,
        createRoomResponse: CreateRoomResponse,
        roomId: number
    ) {
        this.requestHandler = requestHandler
        this.createRoomResponse = createRoomResponse
        this.roomId = roomId
    }

    public exec() {
        this.requestHandler.createRoom(this.createRoomResponse.response, this.roomId)
    }
}