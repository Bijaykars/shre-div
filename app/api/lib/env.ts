import "dotenv/config";

const REQUIRED = ["DATABASE_URL", "SESSION_SECRET"] as const;

// This module is imported before anything else runs, so a missing value fails
// here rather than at any nicer check further down. Report every missing name at
// once with the fix — one-at-a-time errors mean one redeploy per variable.
if (process.env.NODE_ENV === "production") {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error(
      `\nCannot start — missing environment variable(s): ${missing.join(", ")}\n\n` +
        `  DATABASE_URL     MySQL connection string, e.g. mysql://user:pass@host:3306/dbname\n` +
        `                   On Railway, add a MySQL service then use \${{MySQL.MYSQL_URL}}\n` +
        `  SESSION_SECRET   32+ characters, signs the admin session cookie:\n` +
        `                   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"\n\n` +
        `Set them on the host and redeploy.\n`,
    );
    process.exit(1);
  }
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
};
