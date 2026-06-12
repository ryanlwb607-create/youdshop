const supabaseUrl = "https://vngzpblmstezerhnvbpm.supabase.co";
const supabaseKey = "sb_publishable_fx9OReyvJAM7ZKCZ_iHBXg_fcyCiMuJ";

const db = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

async function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await db.auth.signUp({
    email,
    password
  });

  document.getElementById("msg").innerText =
    error ? error.message : "注册成功，请检查邮箱验证";
}

async function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  document.getElementById("msg").innerText =
    error ? error.message : "登录成功";
}

async function logoutUser() {
  await db.auth.signOut();

  document.getElementById("msg").innerText =
    "已退出登录";
}