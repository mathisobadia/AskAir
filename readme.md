# AskAir

Automatically extract document data into Airtable entries with
AI-powered automation. Save time and eliminate manual data entry.

## Dev

npm install && npm run dev

## Stack

- Next.js
- TailwindCSS
- Shadcn
- Airtable
- OpenAI
- Drizzle
- Resend

## Self Hosting

### Current situation

Current architecture assumes you have the following accounts and related keys:

- Airtable as the final destination for the extracted data
- OpenAI to extract data from documents
- Resend to send emails
- Cloudmailin to receive emails
- AWS for hosting files
- Vercel host hosting the frontend
- Neon Database for postgres

### Roadmap

My goal is to make this as easy as possible to self-host with a minimum number of external SaaS dependencies to make sure you data doesn't have to leave your own infrastructure.

Plan is to use [sst.dev](https://sst.dev) and keep everything in the same AWS account.
Neon => Aurora DSQL
Resend => SES
Cloudmailin => SES
Vercel => [OpenNext](https://opennext.js.org/)
OpenAi => There is no easy way to replace OpenAi but we can allow changing the provider to use Claude through Bedrock or other LLM providers.
Airtable => similarly we can export data to other services like Notion, Google Sheets, etc.

## License

Inspired by [Plausible](https://plausible.io/), AskAir is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version. You can [find it here](https://github.com/mathisobadia/AskAir/blob/main/LICENSE).
