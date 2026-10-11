import { campaignRedirect } from '../../../../lib/campaignLinks';

// YouTube video entry link: /go/yt/<videoId>?s=<state>/<suburb>[/<street>]&c=<campaign>
export async function GET(request, { params }) {
  const { id } = await params;
  return campaignRedirect(request, { kind: 'yt', id });
}
