# Self-hosted production deployment

One Docker Compose stack that runs everything hydRate's backend needs on a single machine
(a home server or any small VPS):

| Service  | What it does                                                                  |
|----------|-------------------------------------------------------------------------------|
| `db`     | Postgres 17. Data lives in the `db-data` Docker volume.                        |
| `api`    | The Node server, built from `CloudDockerfile`. Runs migrations on startup.     |
| `caddy`  | Reverse proxy with automatic, free Let's Encrypt HTTPS certificates.           |
| `backup` | `pg_dump` once a day into `BACKUP_DIR`, keeping `BACKUP_KEEP_DAYS` of dumps.   |

Running cost is just the machine: everything above is free. Pictures stay on S3 + CloudFront,
which costs pennies a month at small scale (and is free-tier eligible in the first year).

## 1. Hostname and ports

The app needs a stable HTTPS hostname. Any of these work:

- **A free no-ip DDNS name** (e.g. a new `hydrate-api.ddns.net`, or the existing
  server hostname). Keep the no-ip DUC client running so the name follows your IP.
- A subdomain of a domain you own, pointed at the server.

Then forward **TCP 80, TCP 443 and UDP 443** on the router to the server. Caddy uses port 80 to
prove domain ownership to Let's Encrypt, so both need to be open.

If your ISP blocks inbound 80/443, use a free [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
instead: drop the `caddy` service, run `cloudflared` pointing at `http://api:3000`, and no
port forwarding is needed (requires a domain on Cloudflare).

## 2. AWS credentials for pictures

Create an IAM user just for the server (no console access) with this policy, then put its
access key in `.env.prod`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/fob_pictures/*"
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

Recommended to keep costs predictable: set an
[AWS Budget](https://console.aws.amazon.com/billing/home#/budgets) alert at a few dollars, and
add an S3 lifecycle rule to abort incomplete multipart uploads after 1 day.

## 3. Email for password reset codes

Any SMTP provider works. Free options at hydRate's scale:

- [Brevo](https://www.brevo.com/): 300 emails/day free.
- [Resend](https://resend.com/): 3,000 emails/month free (needs a domain you own).
- A Gmail account with an [app password](https://support.google.com/accounts/answer/185833)
  (`smtp.gmail.com`, port 587): fine to start, but the emails come from that Gmail address.

Without SMTP settings the server still runs, but "forgot password" emails are not sent.

## 4. Start it

```
cd deploy
cp .env.prod.example .env.prod   # then fill it in
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml logs -f api
```

Check `https://YOUR_DOMAIN/` returns `Server OK`, then build the app with
`BACKEND_API_URL=https://YOUR_DOMAIN`.

To deploy a new version: `git pull` then rerun the `up -d --build` command. Migrations run
automatically when the API starts.

## Backups

Dumps land in `deploy/backups/` (or `BACKUP_DIR`). **Copy them off the machine** regularly,
e.g. a cron job that `rclone`s the folder to a free cloud drive, since a backup on the same
disk doesn't survive a disk failure.

Restore into a fresh stack:

```
gunzip -c backups/hydrate-YYYYMMDD-HHMMSS.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db \
  psql -U "$CLOUD_PG_USER" -d "$CLOUD_PG_DB"
```

## Moderation

Review reported content against the production database:

```
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api \
  node dist/scripts/moderate.js list
```

See `src/scripts/moderate.ts` for the other commands (hide/delete pictures, delete fobs or users).
Google Play expects reports to be acted on, so check this regularly (e.g. weekly).
