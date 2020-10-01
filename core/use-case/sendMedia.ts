import { RequestHandler, Data } from "./interface/requestHandler"
import { SendMediaResponse } from "./interface/sendMediaResponse"

export class SendMedia {
    private requestHandler: RequestHandler
    private sendMediaResponse: SendMediaResponse
    private data: Data

    public constructor(
        requestHandler: RequestHandler,
        sendMediaResponse: SendMediaResponse,
        data: Data
    ) {
        this.requestHandler = requestHandler
        this.sendMediaResponse = sendMediaResponse
        this.data = data
    }

    public exec() {
        this.requestHandler.sendMedia(this.sendMediaResponse.response, this.data)
    }
}