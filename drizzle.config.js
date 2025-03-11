import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_o6kIx7iuTnBt@ep-wild-block-a80nnwc9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'
  }
});
