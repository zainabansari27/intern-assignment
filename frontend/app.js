const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  editingId: null
};

const el = {
  loginForm: document.getElementById("login-form"),
  registerForm: document.getElementById("register-form"),
  tabLogin: document.getElementById("tab-login"),
  tabRegister: document.getElementById("tab-register"),
  message: document.getElementById("message"),
  authCard: document.getElementById("auth-card"),
  dashboardCard: document.getElementById("dashboard-card"),
  userInfo: document.getElementById("user-info"),
  logoutBtn: document.getElementById("logout-btn"),
  taskForm: document.getElementById("task-form"),
  taskList: document.getElementById("task-list"),
  adminArea: document.getElementById("admin-area"),
  usersOutput: document.getElementById("users-output"),
  loadUsersBtn: document.getElementById("load-users-btn"),
  apiBase: document.getElementById("api-base")
};

function baseUrl() {
  return el.apiBase.value.trim().replace(/\/$/, "");
}

function showMessage(text, type = "success") {
  el.message.textContent = text;
  el.message.className = `message ${type}`;
}

function clearMessage() {
  el.message.textContent = "";
  el.message.className = "message";
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`${baseUrl()}${path}`, { ...options, headers });
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    const details = Array.isArray(data.errors)
      ? data.errors.map((e) => `${e.field}: ${e.message}`).join(", ")
      : "";
    const msg = details ? `${data.message || "Request failed"} (${details})` : (data.message || "Request failed");
    throw new Error(msg);
  }
  return data;
}

function setSession(user, token) {
  state.user = user;
  state.token = token;
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  updateUi();
}

function clearSession() {
  state.user = null;
  state.token = "";
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  updateUi();
}

function updateUi() {
  const isAuthed = Boolean(state.token && state.user);
  el.authCard.classList.toggle("hidden", isAuthed);
  el.dashboardCard.classList.toggle("hidden", !isAuthed);

  if (isAuthed) {
    el.userInfo.textContent = `Logged in as ${state.user.name} (${state.user.role})`;
    el.adminArea.classList.toggle("hidden", state.user.role !== "admin");
    loadTasks();
  }
}

async function loadTasks() {
  try {
    const res = await api("/tasks");
    const tasks = res.data || [];
    el.taskList.innerHTML = "";

    if (tasks.length === 0) {
      el.taskList.innerHTML = "<p>No tasks found.</p>";
      return;
    }

    for (const task of tasks) {
      const card = document.createElement("div");
      card.className = "task";
      card.innerHTML = `
        <strong>${task.title}</strong>
        <p>${task.description || ""}</p>
        <small>Status: ${task.status}</small>
        <div class="actions">
          <button data-action="edit" data-id="${task.id}">Edit</button>
          <button data-action="delete" data-id="${task.id}" class="outline">Delete</button>
        </div>
      `;
      el.taskList.appendChild(card);
    }
  } catch (err) {
    showMessage(err.message, "error");
  }
}

el.tabLogin.addEventListener("click", () => {
  el.loginForm.classList.remove("hidden");
  el.registerForm.classList.add("hidden");
  el.tabLogin.classList.add("active");
  el.tabRegister.classList.remove("active");
  clearMessage();
});

el.tabRegister.addEventListener("click", () => {
  el.loginForm.classList.add("hidden");
  el.registerForm.classList.remove("hidden");
  el.tabLogin.classList.remove("active");
  el.tabRegister.classList.add("active");
  clearMessage();
});

el.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const payload = {
      email: document.getElementById("login-email").value,
      password: document.getElementById("login-password").value
    };
    const res = await api("/auth/login", { method: "POST", body: JSON.stringify(payload) });
    setSession(res.data.user, res.data.token);
    showMessage("Login successful");
  } catch (err) {
    showMessage(err.message, "error");
  }
});

el.registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const payload = {
      name: document.getElementById("reg-name").value,
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-password").value,
      role: document.getElementById("reg-role").value
    };
    const res = await api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    setSession(res.data.user, res.data.token);
    showMessage("Registration successful");
  } catch (err) {
    showMessage(err.message, "error");
  }
});

el.logoutBtn.addEventListener("click", () => {
  clearSession();
  showMessage("Logged out");
});

el.taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const payload = {
      title: document.getElementById("task-title").value,
      description: document.getElementById("task-description").value,
      status: document.getElementById("task-status").value
    };

    if (state.editingId) {
      await api(`/tasks/${state.editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      state.editingId = null;
      el.taskForm.querySelector("button[type='submit']").textContent = "Create Task";
      showMessage("Task updated");
    } else {
      await api("/tasks", { method: "POST", body: JSON.stringify(payload) });
      showMessage("Task created");
    }

    el.taskForm.reset();
    await loadTasks();
  } catch (err) {
    showMessage(err.message, "error");
  }
});

el.taskList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "delete") {
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      showMessage("Task deleted");
      await loadTasks();
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  if (action === "edit") {
    try {
      const res = await api(`/tasks/${id}`);
      const task = res.data;
      document.getElementById("task-title").value = task.title;
      document.getElementById("task-description").value = task.description;
      document.getElementById("task-status").value = task.status;
      state.editingId = task.id;
      el.taskForm.querySelector("button[type='submit']").textContent = "Update Task";
      showMessage(`Editing task #${task.id}`);
    } catch (err) {
      showMessage(err.message, "error");
    }
  }
});

el.loadUsersBtn.addEventListener("click", async () => {
  try {
    const res = await api("/users");
    el.usersOutput.textContent = JSON.stringify(res.data, null, 2);
    showMessage("Loaded users");
  } catch (err) {
    showMessage(err.message, "error");
  }
});

updateUi();
