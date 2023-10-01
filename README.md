# Blueviewer

A public Bluesky thread viewer, no authentication required, no JS in the client.

Hosted on Cloudflare Workers, this connects to the AppView directly to get the view instead of through a PDS, so there are no authentication involved whatsoever. PDS endpoints are authenticated, AppView endpoints are generally unauthenticated, and that's by design.
