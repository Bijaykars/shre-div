import "dotenv/config";

const REQUIRED = ["DATABASE_URL", "SESSION_SECRET"] as const;

// This module is imported before anything else runs, so a missing value fails
// here rather than at any nicer check further down. Report every missing name at
// once with the fix — one-at-a-time errors mean one redeploy per variable.
const HELP: Record<(typeof REQUIRED)[number], string> = {
  DATABASE_URL:
    "MySQL connection string, e.g. mysql://user:pass@host:3306/dbname\n" +
    "    On Railway: add a MySQL database to the project first, then set\n" +
    "    this variable to ${{MySQL.MYSQL_URL}}",
  SESSION_SECRET:
    "32+ characters, signs the admin session cookie. Generate one with:\n" +
    '    node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
};

if (process.env.NODE_ENV === "production") {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length) {
    // Only describe what's actually missing — printing the full reference every
    // time reads as though every variable is unset.
    console.error(
      `\nCannot start — missing ${missing.length} environment variable(s):\n\n` +
        missing.map((name) => `  ${name}\n    ${HELP[name]}`).join("\n\n") +
        `\n\nSet on the host, then redeploy.\n`,
    );
    process.exit(1);
  }
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
};
