import { ResponseHandler } from "../interface/responseHandler";
import { SendMediaResponse } from "../use-case/interface/sendMediaResponse"

export class IoSendMediaResponse implements SendMediaResponse {
    // private io: socketio.Server = socketio(9090)
    public response: ResponseHandler

    public constructor() {
        this.response = {
            success: this.success,
            error: this.error
        }
    }

    private success(data?: any): void {
        // this.io.emit("success", {})
        console.log("SUCCESS")
    }

    private error(error?: any): void {
        // this.io.emit("error", {})
        console.log("ERROR")
    }
}