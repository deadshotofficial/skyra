import { ApiRequest } from '#lib/api/ApiRequest';
import { ApiResponse } from '#lib/api/ApiResponse';
import { CookieStore } from '#lib/api/CookieStore';
import { DEV } from '#root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Middleware, MiddlewareOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<MiddlewareOptions>({ priority: 30 })
export default class extends Middleware {
	public run(request: ApiRequest, response: ApiResponse) {
		response.cookies = new CookieStore(request, response, !DEV);
	}
}
