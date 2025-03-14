import {
  createDirectus,
  rest,
  authentication,
  readMe,
  login as directusLogin,
  logout as directusLogout,
  type DirectusClient,
  type AuthenticationData,
} from "@directus/sdk";
import type { ApiCollections } from "../../api-collection";

// Define a type for our Directus schema.

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  description?: string;
  bio?: string;
  avatar?: string;
}

export type Category = {
  id: number;
  name: string;
};

export type Creator = {
  id: number;
  specialization: string;
  bio: string | null;
  avatar: string | null;
  user: number | User;
}

export type Work = {
  id: number;
  creator: number | Creator;
  title: string;
  description: string;
  content_type: "image" | "text";
  content: string | null;
  image: string | null;
  category: number | Category;
  published_date: string;
  status: "draft" | "published" | "archived";
}

export type File = {
  id: string;
  storage: string;
  filename_disk: string;
  filename_download: string;
  title: string;
  type: string;
  folder: string | null;
  uploaded_by: string;
  uploaded_on: string;
  modified_by: string;
  modified_on: string;
  charset: string | null;
  filesize: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  embed: string | null;
  description: string | null;
  location: string | null;
  tags: string[] | null;
  metadata: Record<string, any> | null;
}

export type Global = {
  title: string;
  description: string | null;
  writer_cover: string | null;
}

export type Schema = {
  global: Global & Record<string, any>; // Allow other built-in fields.
  directus_users: User & Record<string, any>; // Allow other built-in fields.
  creators: Creator & Record<string, any>;
  works: Work[];
  categories: Category & Record<string, any>;
  directus_files: File & Record<string, any>;
};

export const user = (creator: Work["creator"]): User | null =>
  creator &&
    typeof creator === "object" &&
    creator.user &&
    typeof creator.user === "object"
    ? creator.user
    : null;

const directus_assets = import.meta.env.PUBLIC_DIRECTUS_URL + "/assets";


export const avatar = (user: Creator["user"] | null) =>
  user && typeof user === "object" && user.avatar
    ? `${user.avatar}`
    : null;

export const category = (category: Work["category"] | null) =>
  category && typeof category === "object" ? category : null;


const directus = createDirectus<Schema>(
  import.meta.env.PUBLIC_DIRECTUS_URL,
)
  .with(rest())
  .with(
    authentication("json", {
      autoRefresh: true,
      msRefreshBeforeExpires: 300000,
    }),
  );

// Authentication helper functions
export async function login(email: string, password: string) {
  try {
    const response = await directus.request(
      directusLogin(email, password, {
        // AuthenticationMode : 'cookie'
        mode: "json",
      }),
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    await directus.request(directusLogout());
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const user = await directus.request(
      readMe({
        fields: ["*"], // Specify the fields you want to retrieve
      }),
    );
    return user;
  } catch (error) {
    return null;
  }
}

export default directus;
