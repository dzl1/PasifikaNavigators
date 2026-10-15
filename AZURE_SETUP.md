# Azure backend setup

The site runs on three Azure services:

| Piece | Azure service | Lives in |
| --- | --- | --- |
| Sign-in, sign-up, password reset | Microsoft Entra External ID | Azure portal |
| API (contact form, admin, stories, profiles) | Azure Functions (Node 20) | [`api/`](api/) |
| Database | Azure Database for PostgreSQL – Flexible Server | [`db/schema.sql`](db/schema.sql) |

The React frontend can stay on Vercel. It calls the Function App over HTTPS
with an Entra access token. The browser never connects to the database.

Do the steps in order. Each one produces values that later steps need.

---

## 1. Resource group

```sh
az login
az group create --name pasifika-rg --location newzealandnorth
```

## 2. PostgreSQL database

> **Done (15 Oct 2026):** `pasifika-navigators-db` in New Zealand North, database
> `pasifika`, schema applied. The connection string is in `api/local.settings.json`,
> which is not committed.

```sh
az postgres flexible-server create \
  --resource-group pasifika-rg \
  --name pasifika-navigators-db \
  --location newzealandnorth \
  --tier Burstable --sku-name Standard_B1ms \
  --storage-size 32 --version 16 \
  --admin-user pnadmin --admin-password '<strong-password>' \
  --public-access 0.0.0.0 --yes   # allows Azure services, such as the Function App

az postgres flexible-server db create \
  --resource-group pasifika-rg --server-name pasifika-navigators-db --name pasifika
```

To run the schema from your machine, first allow your IP address through the
firewall:

```sh
az postgres flexible-server firewall-rule create \
  --resource-group pasifika-rg --server-name pasifika-navigators-db \
  --name my-laptop --start-ip-address <your-ip> --end-ip-address <your-ip>

psql "postgres://pnadmin:<password>@pasifika-navigators-db.postgres.database.azure.com:5432/pasifika?sslmode=require" \
  -f db/schema.sql
```

You'll use this connection string as `DATABASE_URL` in step 4:
`postgres://pnadmin:<password>@pasifika-navigators-db.postgres.database.azure.com:5432/pasifika`
URL-encode any special characters in the password.

## 3. Microsoft Entra External ID (accounts)

These steps are done in the [Microsoft Entra admin center](https://entra.microsoft.com).

1. **Create an external tenant.** Go to *Entra ID → Overview → Manage tenants →
   Create → External*. Note the **tenant subdomain** (for example
   `pasifikanavigators`) and the **tenant ID**. Switch into the new tenant.
2. **Create a user flow.** Go to *External Identities → User flows → New user
   flow*. Choose **Email with password** and collect *Display Name*.
3. **Enable password reset.** Go to *Authentication methods* and enable
   **Email OTP**. The sign-in page then shows a "Forgot password?" link.
4. **Register the app.** Go to *App registrations → New registration*.
   Name it "Pasifika Navigators Web" and choose "Accounts in this
   organizational directory only".
   - *Authentication → Add a platform → Single-page application*. Add these
     redirect URIs (the trailing slash matters):
     - `https://www.pasifikanavigators.nz/`
     - `http://localhost:5173/`
     - Also use these as front-channel logout URLs.
   - *Expose an API*: set the Application ID URI to `api://<client-id>`. Then add
     the scope `access_as_user`, consentable by admins and users.
   - *API permissions → Add a permission → My APIs*: pick this app, tick
     `access_as_user`, then **Grant admin consent**.
   - *Token configuration → Add optional claim → Access*: tick `email`.
     If asked, also turn on the Microsoft Graph email permission. The API uses
     this claim to recognise the admin.
   - *Manifest*: set `"requestedAccessTokenVersion": 2` (shown in older
     manifests as `accessTokenAcceptedVersion`).
5. **Link the app to the user flow.** Go to *User flows → (your flow) →
   Applications → Add application*.
6. *(Optional)* Add your logo and colours under *Company branding*.

Values you need:

| Name | Value |
| --- | --- |
| Client ID | *App registration → Overview → Application (client) ID* |
| Authority | `https://<tenant-subdomain>.ciamlogin.com/<tenant-id>` |
| API scope | `api://<client-id>/access_as_user` |

**Admin access.** The admin panel is open to anyone whose email is in
`ADMIN_EMAILS` (default `dave@pasifikanavigators.nz`). Sign up with that email
through the website once the site is live. You can also create an app role
called `Admin` and assign it to users. The API accepts either.

## 4. Function App (API)

```sh
az storage account create --name pasifikafuncstore --resource-group pasifika-rg \
  --location newzealandnorth --sku Standard_LRS

az functionapp create --resource-group pasifika-rg --name pasifika-api \
  --storage-account pasifikafuncstore \
  --flexconsumption-location newzealandnorth \
  --runtime node --runtime-version 20

az functionapp config appsettings set --resource-group pasifika-rg --name pasifika-api --settings \
  DATABASE_URL='postgres://pnadmin:<password>@pasifika-navigators-db.postgres.database.azure.com:5432/pasifika' \
  ENTRA_AUTHORITY='https://<tenant-subdomain>.ciamlogin.com/<tenant-id>' \
  ENTRA_API_AUDIENCE='<client-id>' \
  ADMIN_EMAILS='dave@pasifikanavigators.nz'

az functionapp cors add --resource-group pasifika-rg --name pasifika-api \
  --allowed-origins https://www.pasifikanavigators.nz https://pasifikanavigators.nz
```

Deploy using [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local):

```sh
cd api
npm install
func azure functionapp publish pasifika-api
```

To run the API locally, copy `api/local.settings.example.json` to
`api/local.settings.json`, fill in the values, and run `npm start` in `api/`.
The API runs at `http://localhost:7071/api`.

> **Why not Static Web Apps' built-in API?** Its managed Functions replace the
> `Authorization` header with their own token. That breaks bearer-token auth,
> so the API runs as its own Function App instead.

## 5. Frontend environment variables

Set these in Vercel (*Project → Settings → Environment Variables*) and in a
local `.env` for development (see [`.env.example`](.env.example)):

```
VITE_ENTRA_CLIENT_ID=<client-id>
VITE_ENTRA_AUTHORITY=https://<tenant-subdomain>.ciamlogin.com/<tenant-id>
VITE_ENTRA_API_SCOPE=api://<client-id>/access_as_user
VITE_API_BASE_URL=https://pasifika-api.azurewebsites.net/api
```

Delete the old `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables from
Vercel, then redeploy.

## 6. Moving existing data (optional)

If you can still reach the old Supabase database, export just the data:

```sh
pg_dump "<supabase-connection-string>" --data-only --no-owner \
  -t public.contact_messages -t public.learning_pathways > supabase-data.sql
psql "<azure-connection-string>?sslmode=require" -f supabase-data.sql
```

- **Contact messages and learning pathways** import directly. The table shapes
  are unchanged.
- **Stories** were owned by Supabase user IDs. Those IDs don't exist in Entra.
  Import them after the authors have signed up again, then update `owner_id` to
  each author's Entra object ID: *Entra admin center → Users → (user) → Object ID*.
- **User accounts and passwords can't be moved.** Supabase password hashes
  can't be imported into Entra, so users need to register again. This includes
  the admin account.
