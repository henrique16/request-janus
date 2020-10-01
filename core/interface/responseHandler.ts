export interface ResponseHandler {
    success: (data?: any) => void
    error: (error?: any) => void
}