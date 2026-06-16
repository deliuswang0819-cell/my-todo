const state = {
  currentCategory: "Work",
  tasks: []
};

const db = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const el = {
  tabs: document.querySelectorAll(".tab"),
  form: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  dateInput: document.querySelector("#dateInput"),
  priorityInput: document.querySelector("#priorityInput"),
  statusText: document.querySelector("#statusText"),
  template: document.querySelector("#taskTemplate"),
  lists: {
    todo: document.querySelector("#todoList"),
    today: document.querySelector("#todayList"),
    week: document.querySelector("#weekList"),
    month: document.querySelector("#monthList"),
    long: document.querySelector("#longList")
  },
  counts: {
    today: document.querySelector("#todayCount"),
    week: document.querySelector("#weekCount"),
    month: document.querySelector("#monthCount"),
    long: document.querySelector("#longCount")
  }
};

function setStatus(message, isError = false) {
  el.statusText.textContent = message;
  el.statusText.classList.toggle("error", isError);
}

async function loadTasks() {
  setStatus("Loading from Supabase...");

  const { data, error } = await db
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    setStatus(`Supabase error: ${error.message}`, true);
    return;
  }

  state.tasks = data.map(row => ({
    id: row.id,
    title: row.title,
    dueDate: row.due_date || "",
    priority: row.priority,
    category: row.category,
    done: row.done,
    createdAt: row.created_at
  }));

  setStatus("Synced with Supabase");
  render();
}

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getBucket(task) {
  if (!task.dueDate) return "long";

  const today = normalizeDate(new Date());
  const due = normalizeDate(task.dueDate);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "today";
  if (diffDays <= 7) return "week";
  if (due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear()) return "month";
  return "long";
}

function formatDate(date) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric"
  });
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function createTaskNode(task) {
  const node = el.template.content.firstElementChild.cloneNode(true);
  const checkbox = node.querySelector(".done-input");
  const title = node.querySelector(".task-title");
  const date = node.querySelector(".task-date");
  const priority = node.querySelector(".task-priority");
  const deleteButton = node.querySelector(".delete-button");
  const moveButton = node.querySelector(".move-button");

  node.classList.toggle("done", task.done);
  checkbox.checked = task.done;
  title.textContent = task.title;
  date.textContent = formatDate(task.dueDate);
  priority.textContent = task.priority;
  priority.className = `task-priority ${priorityClass(task.priority)}`;

  checkbox.addEventListener("change", async () => {
    const newDone = checkbox.checked;
    const { error } = await db
      .from("tasks")
      .update({ done: newDone })
      .eq("id", task.id);

    if (error) {
      console.error(error);
      setStatus(`Update failed: ${error.message}`, true);
      return;
    }

    task.done = newDone;
    render();
  });

  deleteButton.addEventListener("click", async () => {
    const { error } = await db
      .from("tasks")
      .delete()
      .eq("id", task.id);

    if (error) {
      console.error(error);
      setStatus(`Delete failed: ${error.message}`, true);
      return;
    }

    state.tasks = state.tasks.filter(item => item.id !== task.id);
    render();
  });

  moveButton.addEventListener("click", async () => {
    const newCategory = task.category === "Work" ? "Life" : "Work";

    const { error } = await db
      .from("tasks")
      .update({ category: newCategory })
      .eq("id", task.id);

    if (error) {
      console.error(error);
      setStatus(`Move failed: ${error.message}`, true);
      return;
    }

    task.category = newCategory;
    render();
  });

  return node;
}

function render() {
  Object.values(el.lists).forEach(list => list.innerHTML = "");

  const visibleTasks = state.tasks.filter(task => task.category === state.currentCategory);
  const counts = { today: 0, week: 0, month: 0, long: 0 };

  visibleTasks.forEach(task => {
    el.lists.todo.appendChild(createTaskNode(task));

    const bucket = getBucket(task);
    counts[bucket] += 1;
    el.lists[bucket].appendChild(createTaskNode(task));
  });

  Object.entries(counts).forEach(([bucket, count]) => {
    el.counts[bucket].textContent = count;
  });
}

el.form.addEventListener("submit", async event => {
  event.preventDefault();

  const title = el.taskInput.value.trim();
  if (!title) return;

  const newTask = {
    title,
    due_date: el.dateInput.value || null,
    priority: el.priorityInput.value,
    category: state.currentCategory,
    done: false
  };

  const { data, error } = await db
    .from("tasks")
    .insert(newTask)
    .select()
    .single();

  if (error) {
    console.error(error);
    setStatus(`Add failed: ${error.message}`, true);
    return;
  }

  state.tasks.unshift({
    id: data.id,
    title: data.title,
    dueDate: data.due_date || "",
    priority: data.priority,
    category: data.category,
    done: data.done,
    createdAt: data.created_at
  });

  el.form.reset();
  el.priorityInput.value = "Medium";
  el.taskInput.focus();
  setStatus("Synced with Supabase");
  render();
});

el.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    state.currentCategory = tab.dataset.category;
    el.tabs.forEach(item => item.classList.toggle("active", item === tab));
    render();
  });
});

loadTasks();
