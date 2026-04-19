/** Set `VITE_LESSONS_API_URL` in `.env` / `.env.local` to your deployed lessons Lambda URL (same pattern as other APIs). */
const lessonsFromEnv = (import.meta.env.VITE_LESSONS_API_URL as string | undefined)?.trim() ?? "";

export const API_URLS = {
  auth: "https://8aey0m4yvf.execute-api.ap-south-2.amazonaws.com/default/auth",
  users: "https://elgw4pwn4m.execute-api.ap-south-2.amazonaws.com/default/users",
  curriculum: "https://fy43w82sx3.execute-api.ap-south-2.amazonaws.com/default/circullam",
  reports: "https://3c4dycar5b.execute-api.ap-south-2.amazonaws.com/default/reports",
  seed: "https://7s0thxe2lj.execute-api.ap-south-2.amazonaws.com/default/seed_data",
  gallery: "https://hme2pc3rq5.execute-api.ap-south-2.amazonaws.com/default/gallery",
  lessons: lessonsFromEnv,
};
