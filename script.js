const STORAGE_KEY = "ziki-task-board-v3";

const state = {
  currentCategory: "Work",
  tasks: loadTasks()
};

const el = {
  tabs: document.querySelectorAll(".tab"),
  form: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  dateInput: document.querySelector("#dateInput"),
  priorityInput: document.querySelector("#priorityInput"),
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

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
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

  checkbox.addEventListener("change", () => {
    task.done = checkbox.checked;
    saveTasks();
    render();
  });

  deleteButton.addEventListener("click", () => {
    state.tasks = state.tasks.filter(item => item.id !== task.id);
    saveTasks();
    render();
  });

  moveButton.addEventListener("click", () => {
    task.category = task.category === "Work" ? "Life" : "Work";
    saveTasks();
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

el.form.addEventListener("submit", event => {
  event.preventDefault();

  const title = el.taskInput.value.trim();
  if (!title) return;

  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    dueDate: el.dateInput.value,
    priority: el.priorityInput.value,
    category: state.currentCategory,
    done: false,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  el.form.reset();
  el.priorityInput.value = "Medium";
  el.taskInput.focus();
  render();
});

el.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    state.currentCategory = tab.dataset.category;
    el.tabs.forEach(item => item.classList.toggle("active", item === tab));
    render();
  });
});

render();
