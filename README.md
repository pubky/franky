![Franky Logo](/public/franky.png)

# Franky

Franky is a social media app that uses Pubky Protocol.

---

## Getting Started

First, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy the example environment file and adjust the values as needed:

```bash
cp .env.example .env
```

Available environment variables:

```bash
# Database version (default: 1)
NEXT_PUBLIC_DB_VERSION=1

# Sync time to live in milliseconds (default: 300000 - 5 minutes)
NEXT_PUBLIC_SYNC_TTL=300000

# Debug mode (default: false)
NEXT_PUBLIC_DEBUG_MODE=false

# Nexus API URL (default: https://nexus.staging.pubky.app/v0)
NEXT_PUBLIC_NEXUS_URL=https://nexus.staging.pubky.app/v0
```

## License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for more details.
