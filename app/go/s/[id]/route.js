import { campaignRedirect } from '../../../../lib/campaignLinks';

// Social / blog / other entry link:
// /go/s/<code>?src=facebook|instagram|linkedin|blog|email|other&s=<state>/<suburb>[/<street>]&c=<campaign>
export async function GET(request, { params }) {
  const { id } = await params;
  return campaignRedirect(request, { kind: 's', id });
}
