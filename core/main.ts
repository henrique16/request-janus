import { HttpRequestHandler } from "./adpater/httpRequestHandler"
import { IoCreateRoomResponse } from "./adpater/ioCreateRoomResponse"
import { IoSendMediaResponse } from "./adpater/ioSendMediaResponse"
import { MapRepositoryHandler } from "./adpater/mapRepositoryHandler"
import { WsRequestHandler } from "./adpater/wsRequestHandler"
import { RepositoryHandler } from "./interface/repositoryHandler"
import { CreateRoom } from "./use-case/createRoom"
import { CreateRoomResponse } from "./use-case/interface/createRoomResponse"
import { Data, RequestHandler } from "./use-case/interface/requestHandler"
import { SendMediaResponse } from "./use-case/interface/sendMediaResponse"
import { SendMedia } from "./use-case/sendMedia"

const repositoryHandler: RepositoryHandler = new MapRepositoryHandler()
const wsRequestHandler: WsRequestHandler = new WsRequestHandler(repositoryHandler)
const httpRequestHandler: RequestHandler = new HttpRequestHandler()
const createRoomResponse: CreateRoomResponse = new IoCreateRoomResponse()

function createRoomWs() {
    wsRequestHandler.open()
        .then(() => {
            const cr = new CreateRoom(wsRequestHandler, createRoomResponse, 2)
            cr.exec()
            setTimeout(() => {
                repositoryHandler.getRoom(2)
                    .then(data => console.log(data))
                    .catch(error => console.error(error))
            }, 1000);
        })
        .catch(error => console.error(error))
}

function createRoomHttp() {
    const cr = new CreateRoom(httpRequestHandler, createRoomResponse, 3)
    cr.exec()
}

createRoomWs()