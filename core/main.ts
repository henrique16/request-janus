import { HttpRequestHandler } from "./adpater/httpRequestHandler"
import { IoCreateRoomResponse } from "./adpater/ioCreateRoomResponse"
import { IoSendMediaResponse } from "./adpater/ioSendMediaResponse"
import { WsRequestHandler } from "./adpater/wsRequestHandler"
import { CreateRoom } from "./use-case/createRoom"
import { CreateRoomResponse } from "./use-case/interface/createRoomResponse"
import { Data, RequestHandler } from "./use-case/interface/requestHandler"
import { SendMediaResponse } from "./use-case/interface/sendMediaResponse"
import { SendMedia } from "./use-case/sendMedia"

const wsRequestHandler: WsRequestHandler = new WsRequestHandler()
const httpRequestHandler: RequestHandler = new HttpRequestHandler()
const createRoomResponse: CreateRoomResponse = new IoCreateRoomResponse()

function createRoomWs() {
    wsRequestHandler.open()
        .then(() => {
            const cr = new CreateRoom(wsRequestHandler, createRoomResponse, 1)
            cr.exec()
        })
        .catch(error => console.error(error))
}

function createRoomHttp() {
    const cr = new CreateRoom(httpRequestHandler, createRoomResponse, 1)
    cr.exec()
}

createRoomWs()