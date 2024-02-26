import { Request } from '../parser/ast';
import { sendHttpRequest } from './http-client';

export async function evaluate(requests: Request[]) {
    for (const request of requests) {
        const httpResponse = await sendHttpRequest(request)
        console.log(httpResponse.status)
    }
}