import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from("images").select("*").limit(1);
    if (error) throw error;

    res.status(200).json({
      url: process.env.SUPABASE_URL ? "OK" : "NOT FOUND",
      anonKey: process.env.SUPABASE_KEY ? "OK" : "NOT FOUND",
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "NOT FOUND",
      testData: data,
    });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
}
