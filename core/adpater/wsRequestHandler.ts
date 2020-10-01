import { RequestHandler, Data } from "../use-case/interface/requestHandler"
import { ResponseHandler } from "../interface/responseHandler"
import config from "../config/index"
import Ws from "ws"
import shortid from "shortid"
import { RepositoryHandler } from "../interface/repositoryHandler"

interface Callback {
    (data: Data, error?: any): void
}

export class WsRequestHandler implements RequestHandler {
    private repositoryHandler: RepositoryHandler
    private controller: Map<string, Callback>
    private ws: Ws | null
    public dataRoom: Data | null

    public constructor(repositoryHandler: RepositoryHandler) {
        this.repositoryHandler = repositoryHandler
        this.controller = new Map<string, Callback>()
        this.ws = null
        this.dataRoom = null
    }

    public open(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new Ws(config.janus.ws.url, config.janus.ws.protocol)
            this.ws.on("open", () => {
                console.log("WEBSOCKET OPEN")
                this.listener()
                return resolve()
            })
            this.ws.on("error", (error) => {
                console.error(error)
                this.ws = null
                return reject()
            })
        })
    }

    public createRoom(responseHandler: ResponseHandler, roomId: number): void {
        this.create((dataCreate: Data, error?: any) => {
            if (error) return responseHandler.error()
            this.attach(dataCreate, (dataAttach: Data, error?: any) => {
                if (error) return responseHandler.error()
                dataAttach.roomId = roomId
                this.room(dataAttach, (dataRoom: Data, error?: any) => {
                    if (error) return responseHandler.error()
                    this.repositoryHandler.setRoom(responseHandler, {
                        roomId: roomId,
                        sessionId: dataRoom.message.session_id,
                        sender: dataRoom.message.sender
                    })
                })
            })
        })
    }

    public sendMedia(responseHandler: ResponseHandler, data: Data): void {
        this.attach(data, (dataAttach: Data, error?: any) => {
            if (error) return responseHandler.error()
            dataAttach.candidate = data.candidate
            dataAttach.roomId = data.roomId
            this.trickle(dataAttach)
            this.joinPublisher(dataAttach, (dataJoin: Data, error?: any) => {
                if (error) return responseHandler.error()
                dataJoin.sdp = data.sdp
                dataJoin.type = data.type
                this.publish(dataJoin, (dataPublish: Data, error?: any) => {
                    if (error) return responseHandler.error()
                    const sender: string = dataPublish.message.sender.toString()
                    this.setInEndpoints(sender, dataPublish)
                    responseHandler.success()
                })
            })
        })
    }

    private listener(): void {
        this.ws?.on("message", (data: Ws.Data) => {
            const message: any = JSON.parse(data.toString())
            const transaction: string = message.transaction
            console.log(message)
            switch (message.janus) {
                case "ack":
                    break
                case "error":
                    this.getInController(transaction)
                        .then(callback => {
                            const data: Data = { message: message }
                            callback(data, "error")
                            this.deleteInController(transaction)
                        })
                        .catch(() => { })
                    break
                default:
                    this.getInController(transaction)
                        .then(callback => {
                            const data: Data = { message: message }
                            callback(data)
                            this.deleteInController(transaction)
                        })
                        .catch(() => { })
                    break
            }
        })
    }

    private getInController(key: string): Promise<Callback> {
        const callback = this.controller.get(key)
        if (!callback) return Promise.reject()
        return Promise.resolve(callback)
    }

    private setInController(key: string, callback: Callback): void {
        this.controller.set(key, callback)
    }

    private deleteInController(key: string): void {
        this.controller.delete(key)
    }

    private getInEndpoints(key: string): Promise<Callback> {
        const data = this.dataRoom?.endpoints?.get(key)
        if (!data) return Promise.reject()
        return Promise.resolve(data)
    }

    private setInEndpoints(key: string, data: any): void {
        this.dataRoom?.endpoints?.set(key, data)
    }

    private deleteInEndpoints(key: string): void {
        this.dataRoom?.endpoints?.delete(key)
    }

    private create(callback: Callback): void {
        const transaction = shortid.generate()
        const msg = {
            janus: "create",
            transaction: transaction
        }
        this.setInController(transaction, callback)
        this.ws?.send(JSON.stringify(msg), (error) => {
            if (error) {
                this.deleteInController(transaction)
                const data: Data = { message: null }
                callback(data, "error")
            }
        })
    }

    private attach(data: Data, callback: Callback): void {
        const message = data.message
        const transaction = shortid.generate()
        const msg = {
            janus: "attach",
            plugin: "janus.plugin.videoroom",
            transaction: transaction,
            session_id: message.session_id || message.data.id
        }
        this.setInController(transaction, callback)
        this.ws?.send(JSON.stringify(msg), (error) => {
            if (error) {
                this.deleteInController(transaction)
                const data: Data = { message: null }
                callback(data, "error")
            }
        })
    }

    private room(data: Data, callback: Callback): void {
        const message = data.message
        const transaction = shortid.generate()
        const msg = {
            janus: "message",
            transaction: transaction,
            session_id: message.session_id,
            handle_id: message.data.id,
            body: {
                request: "create",
                publishers: 100,
                bitrate: 2500000,
                videocodec: "vp8",
                audiocodec: 'opus',
                room: data.roomId,
                //rec_dir: `${config.rawMjrDir}/${client.roomName}`,
                bitrate_cap: true,
                transport_wide_cc_ext: true
            }
        }
        this.setInController(transaction, callback)
        this.ws?.send(JSON.stringify(msg), (error) => {
            if (error) {
                this.deleteInController(transaction)
                const data: Data = { message: null }
                callback(data, "error")
            }
        })
    }

    private joinPublisher(data: Data, callback: Callback) {
        const message = data.message
        const transaction = shortid.generate()
        const msg = {
            janus: "message",
            handle_id: message.data.id,
            session_id: message.session_id,
            transaction: transaction,
            body: {
                request: "join",
                room: data.roomId,
                ptype: "publisher",
                display: "no"
            }
        }
        this.setInController(transaction, callback)
        this.ws?.send(JSON.stringify(msg), (error) => {
            if (error) {
                this.deleteInController(transaction)
                const data: Data = { message: null }
                callback(data, "error")
            }
        })
    }

    private publish(data: Data, callback: Callback) {
        const message = data.message
        const transaction = shortid.generate()
        const isAudio = data.type === "mic" ? true : false
        const msg = {
            janus: "message",
            jsep: {
                type: "offer",
                sdp: data.sdp
            },
            handle_id: message.sender,
            session_id: message.session_id,
            transaction: transaction,
            body: {
                request: "publish",
                audio: isAudio,
                video: !isAudio,
                bitrate: 2500000,
                record: false
            }
        }
        this.setInController(transaction, callback)
        this.ws?.send(JSON.stringify(msg), (error) => {
            if (error) {
                this.deleteInController(transaction)
                const data: Data = { message: null }
                callback(data, "error")
            }
        })
    }

    private trickle(data: Data) {
        const message = data.message
        const transaction = shortid.generate()
        const msg = {
            janus: "trickle",
            candidate: data.candidate,
            transaction: transaction,
            session_id: message.session_id,
            handle_id: message.sender || message.data.id
        }
        this.ws?.send(JSON.stringify(msg), (error) => {
            if (error) console.error("trickle", error)
        })
    }
}