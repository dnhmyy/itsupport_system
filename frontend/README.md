# OpsCore IT Support System Frontend

## Local development

Copy the local example file first:

```bash
cp .env.local.example .env.local
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The frontend expects the backend API at `http://localhost:8000/api` during local development.

## Production

Production base URL for this repository:
- `https://support.akhdnn.web.id`

Production API base URL:
- `https://support.akhdnn.web.id/api`

Use the root production env file for Docker deployment instead of `.env.local`.

## Notes

- Do not commit `.env.local`
- Keep all production values in the root `.env`
- Keep `NEXT_PUBLIC_API_URL` aligned with the backend deployment domain
