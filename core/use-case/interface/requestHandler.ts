import { ResponseHandler } from "../../interface/responseHandler"

export interface Data {
    message: any,
    candidate?: any,
    type?: string,
    sdp?: string,
    roomId?: number,
    endpoints?: Map<string, any>
}

export interface RequestHandler {
    createRoom: (responseHandler: ResponseHandler, roomId: number) => void
    sendMedia: (responseHandler: ResponseHandler, data: Data) => void
}