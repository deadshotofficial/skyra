import { ApiRequest } from '#lib/api/ApiRequest';
import { ApiResponse } from '#lib/api/ApiResponse';
import { DbSet } from '#lib/database';
import { TOKENS } from '#root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ name: 'webhooks/b4d', route: 'webhooks/b4d' })
export default class extends Route {
	public async post(request: ApiRequest, response: ApiResponse) {
		if (request.headers.authorization !== TOKENS.WEBHOOK_B4D) return response.forbidden();
		if (!request.body) return response.badRequest();

		const body = request.body as Body;
		try {
			const { users } = await DbSet.connect();
			await users.lock([body.user], async (id) => {
				const user = await users.ensure(id);

				user.money += body.votes.totalVotes % 5 === 0 ? 1200 : 400;
				await user.save();
			});

			return response.noContent();
		} catch (error) {
			this.client.emit('error', error);
			return response.error(error.message ?? 'Unknown error');
		}
	}
}

interface Body {
	user: string;
	bot: string;
	votes: BodyVotes;
	type: 'vote' | 'test';
}

interface BodyVotes {
	totalVotes: number;
	votes24: number;
	votesMonth: number;
	hasVoted: string[];
	hasVoted24: string[];
}
