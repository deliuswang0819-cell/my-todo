
function setupPinGate() {
  const pinScreen = document.querySelector("#pinScreen");
  const appPage = document.querySelector("#appPage");
  const pinForm = document.querySelector("#pinForm");
  const pinInput = document.querySelector("#pinInput");
  const pinError = document.querySelector("#pinError");

  if (!pinScreen || !appPage || !pinForm || !pinInput) return;

  const unlock = () => {
    pinScreen.style.display = "none";
    appPage.classList.remove("app-hidden");
  };

  if (sessionStorage.getItem("ziki-pin-unlocked") === "yes") {
    unlock();
    return;
  }

  pinInput.focus();

  pinForm.addEventListener("submit", event => {
    event.preventDefault();

    if (pinInput.value === APP_PIN) {
      sessionStorage.setItem("ziki-pin-unlocked", "yes");
      pinInput.value = "";
      unlock();
      return;
    }

    pinError.textContent = "Wrong PIN. Human memory has betrayed us again.";
    pinInput.value = "";
    pinInput.focus();
  });
}

setupPinGate();

const state = {
  currentView: "Work",
  currentCategory: "Work",
  tasks: [],
  events: [],
  notes: [],
  calendarDate: new Date(),
  selectedDate: toISODate(new Date()),
  editingTaskId: null
};

const db = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const HOLIDAYS = [
  { date: "2026-01-01", title: "Nieuwjaarsdag", country: "NL" },
  { date: "2026-04-03", title: "Goede Vrijdag", country: "NL" },
  { date: "2026-04-05", title: "Eerste Paasdag", country: "NL" },
  { date: "2026-04-06", title: "Tweede Paasdag", country: "NL" },
  { date: "2026-04-27", title: "Koningsdag", country: "NL" },
  { date: "2026-05-05", title: "Bevrijdingsdag", country: "NL" },
  { date: "2026-05-14", title: "Hemelvaartsdag", country: "NL" },
  { date: "2026-05-24", title: "Eerste Pinksterdag", country: "NL" },
  { date: "2026-05-25", title: "Tweede Pinksterdag", country: "NL" },
  { date: "2026-12-25", title: "Eerste Kerstdag", country: "NL" },
  { date: "2026-12-26", title: "Tweede Kerstdag", country: "NL" },

  { date: "2026-01-01", title: "元旦", country: "CN" },
  { date: "2026-01-02", title: "元旦假期", country: "CN" },
  { date: "2026-01-03", title: "元旦假期", country: "CN" },
  { date: "2026-02-15", title: "春节", country: "CN" },
  { date: "2026-02-16", title: "春节", country: "CN" },
  { date: "2026-02-17", title: "春节", country: "CN" },
  { date: "2026-02-18", title: "春节", country: "CN" },
  { date: "2026-02-19", title: "春节", country: "CN" },
  { date: "2026-02-20", title: "春节", country: "CN" },
  { date: "2026-02-21", title: "春节", country: "CN" },
  { date: "2026-02-22", title: "春节", country: "CN" },
  { date: "2026-02-23", title: "春节", country: "CN" },
  { date: "2026-04-04", title: "清明节", country: "CN" },
  { date: "2026-04-05", title: "清明节假期", country: "CN" },
  { date: "2026-04-06", title: "清明节假期", country: "CN" },
  { date: "2026-05-01", title: "劳动节", country: "CN" },
  { date: "2026-05-02", title: "劳动节假期", country: "CN" },
  { date: "2026-05-03", title: "劳动节假期", country: "CN" },
  { date: "2026-05-04", title: "劳动节假期", country: "CN" },
  { date: "2026-05-05", title: "劳动节假期", country: "CN" },
  { date: "2026-06-19", title: "端午节", country: "CN" },
  { date: "2026-06-20", title: "端午节假期", country: "CN" },
  { date: "2026-06-21", title: "端午节假期", country: "CN" },
  { date: "2026-09-25", title: "中秋节", country: "CN" },
  { date: "2026-09-26", title: "中秋节假期", country: "CN" },
  { date: "2026-09-27", title: "中秋节假期", country: "CN" },
  { date: "2026-10-01", title: "国庆节", country: "CN" },
  { date: "2026-10-02", title: "国庆节假期", country: "CN" },
  { date: "2026-10-03", title: "国庆节假期", country: "CN" },
  { date: "2026-10-04", title: "国庆节假期", country: "CN" },
  { date: "2026-10-05", title: "国庆节假期", country: "CN" },
  { date: "2026-10-06", title: "国庆节假期", country: "CN" },
  { date: "2026-10-07", title: "国庆节假期", country: "CN" }
];

const el = {
  tabs: document.querySelectorAll(".tab"),
  refreshButton: document.querySelector("#refreshButton"),

  taskView: document.querySelector("#taskView"),
  calendarView: document.querySelector("#calendarView"),
  noteView: document.querySelector("#noteView"),

  taskForm: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  dateInput: document.querySelector("#dateInput"),
  priorityInput: document.querySelector("#priorityInput"),
  statusText: document.querySelector("#statusText"),
  taskTemplate: document.querySelector("#taskTemplate"),
  taskEditOverlay: document.querySelector("#taskEditOverlay"),
  taskEditSheet: document.querySelector("#taskEditSheet"),
  taskEditClose: document.querySelector("#taskEditClose"),
  taskEditCancel: document.querySelector("#taskEditCancel"),
  editTaskTitle: document.querySelector("#editTaskTitle"),
  editTaskDate: document.querySelector("#editTaskDate"),
  editTaskPriority: document.querySelector("#editTaskPriority"),
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
  },

  calendarTitle: document.querySelector("#calendarTitle"),
  calendarGrid: document.querySelector("#calendarGrid"),
  prevMonthButton: document.querySelector("#prevMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  eventForm: document.querySelector("#eventForm"),
  eventTitleInput: document.querySelector("#eventTitleInput"),
  eventDateInput: document.querySelector("#eventDateInput"),
  eventCategoryInput: document.querySelector("#eventCategoryInput"),
  eventTemplate: document.querySelector("#eventTemplate"),
  selectedDateTitle: document.querySelector("#selectedDateTitle"),
  selectedDateHint: document.querySelector("#selectedDateHint"),
  selectedDateCount: document.querySelector("#selectedDateCount"),
  selectedEventsList: document.querySelector("#selectedEventsList"),

  noteForm: document.querySelector("#noteForm"),
  noteTitleInput: document.querySelector("#noteTitleInput"),
  noteBodyInput: document.querySelector("#noteBodyInput"),
  noteTemplate: document.querySelector("#noteTemplate"),
  notesList: document.querySelector("#notesList"),
  notesCount: document.querySelector("#notesCount")
};

function setStatus(message, isError = false) {
  el.statusText.textContent = message;
  el.statusText.classList.toggle("error", isError);
}

function toISODate(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

function formatLongDate(date) {
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
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

async function loadAll() {
  await Promise.all([loadTasks(), loadEvents(), loadNotes()]);
  renderAll();
}

async function loadTasks() {
  setStatus("Loading from Supabase...");
  const { data, error } = await db.from("tasks").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    setStatus(`Task error: ${error.message}`, true);
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
}

async function loadEvents() {
  const { data, error } = await db.from("events").select("*").order("event_date", { ascending: true });
  if (error) {
    console.error(error);
    setStatus(`Event table missing or blocked: ${error.message}`, true);
    return;
  }

  state.events = data.map(row => ({
    id: row.id,
    title: row.title,
    date: row.event_date,
    category: row.category || "Life",
    createdAt: row.created_at
  }));
}

async function loadNotes() {
  const { data, error } = await db.from("notes").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    setStatus(`Note table missing or blocked: ${error.message}`, true);
    return;
  }

  state.notes = data.map(row => ({
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at
  }));
}


function openTaskEditSheet(task) {
  state.editingTaskId = task.id;
  el.editTaskTitle.value = task.title;
  el.editTaskDate.value = task.dueDate || "";
  el.editTaskPriority.value = task.priority || "Medium";
  el.taskEditOverlay.hidden = false;
  setTimeout(() => el.editTaskTitle.focus(), 50);
}

function closeTaskEditSheet() {
  state.editingTaskId = null;
  el.taskEditOverlay.hidden = true;
  el.taskEditSheet.reset();
}


function createTaskNode(task) {
  const node = el.taskTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = node.querySelector(".done-input");
  const title = node.querySelector(".task-title");
  const date = node.querySelector(".task-date");
  const priority = node.querySelector(".task-priority");
  const deleteButton = node.querySelector(".delete-button");
  const editButton = node.querySelector(".edit-button");

  node.classList.toggle("done", task.done);
  checkbox.checked = task.done;
  title.textContent = task.title;
  date.textContent = formatDate(task.dueDate);
  priority.textContent = task.priority;
  priority.className = `task-priority ${priorityClass(task.priority)}`;


  editButton.addEventListener("click", () => {
    openTaskEditSheet(task);
  });

  checkbox.addEventListener("change", async () => {
    const { error } = await db.from("tasks").update({ done: checkbox.checked }).eq("id", task.id);
    if (error) return setStatus(`Update failed: ${error.message}`, true);
    task.done = checkbox.checked;
    renderTasks();
  });

  deleteButton.addEventListener("click", async () => {
    const { error } = await db.from("tasks").delete().eq("id", task.id);
    if (error) return setStatus(`Delete failed: ${error.message}`, true);
    state.tasks = state.tasks.filter(item => item.id !== task.id);
    renderTasks();
  });

  return node;
}

function renderTasks() {
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

function switchView(view) {
  state.currentView = view;

  const showTasks = view === "Work" || view === "Life";
  const showCalendar = view === "Calendar";
  const showNote = view === "Note";

  el.taskView.hidden = !showTasks;
  el.calendarView.hidden = !showCalendar;
  el.noteView.hidden = !showNote;

  // Double lock the display state because browsers are tiny chaos machines.
  el.taskView.style.display = showTasks ? "" : "none";
  el.calendarView.style.display = showCalendar ? "" : "none";
  el.noteView.style.display = showNote ? "" : "none";

  if (showTasks) {
    state.currentCategory = view;
    renderTasks();
  }

  if (showCalendar) renderCalendar();
  if (showNote) renderNotes();

  el.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.view === view));
}

function getItemsForDate(date) {
  const holidays = HOLIDAYS.filter(item => item.date === date).map(item => ({ ...item, type: "holiday" }));
  const events = state.events.filter(item => item.date === date).map(item => ({ ...item, country: "ME", type: "event" }));
  return [...holidays, ...events];
}

function renderCalendar() {
  const year = state.calendarDate.getFullYear();
  const month = state.calendarDate.getMonth();
  el.calendarTitle.textContent = state.calendarDate.toLocaleDateString("en-GB", { year: "numeric", month: "long" });
  el.calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + i);
    const dateString = toISODate(cellDate);
    const items = getItemsForDate(dateString);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-cell";
    if (cellDate.getMonth() !== month) button.classList.add("other-month");
    if (dateString === state.selectedDate) button.classList.add("selected");

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = cellDate.getDate();
    button.appendChild(number);

    items.slice(0, 3).forEach(item => {
      const tag = document.createElement("span");
      tag.className = "day-tag";
      tag.classList.add(item.type === "event" ? "tag-event" : item.country === "CN" ? "tag-cn" : "tag-nl");
      tag.textContent = item.type === "event" ? `• ${item.title}` : `${item.country} ${item.title}`;
      button.appendChild(tag);
    });

    if (items.length > 3) {
      const more = document.createElement("span");
      more.className = "day-tag";
      more.textContent = `+${items.length - 3} more`;
      button.appendChild(more);
    }

    button.addEventListener("click", () => {
      state.selectedDate = dateString;
      el.eventDateInput.value = dateString;
      renderCalendar();
    });

    el.calendarGrid.appendChild(button);
  }

  renderSelectedDate();
}

function renderSelectedDate() {
  const items = getItemsForDate(state.selectedDate);
  el.selectedDateTitle.textContent = formatLongDate(state.selectedDate);
  el.selectedDateHint.textContent = "Holidays are read-only. Your events can be deleted.";
  el.selectedDateCount.textContent = items.length;
  el.selectedEventsList.innerHTML = "";

  items.forEach(item => {
    const node = el.eventTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".event-title").textContent = item.title;
    node.querySelector(".event-meta").textContent =
      item.type === "event" ? `Your event · ${item.category}` : `${item.country} holiday`;
    node.querySelector(".event-dot").style.background =
      item.type === "event" ? "#3f8a55" : item.country === "CN" ? "#d94b32" : "#2f6fba";

    const deleteButton = node.querySelector(".event-delete");
    const editButton = node.querySelector(".event-edit");
    if (item.type === "holiday") {
      deleteButton.style.display = "none";
      editButton.style.display = "none";
    } else {
      editButton.addEventListener("click", async () => {
        const newTitle = prompt("Edit event title", item.title);
        if (newTitle === null) return;
        const titleValue = newTitle.trim();
        if (!titleValue) return;

        const newDate = prompt("Edit event date as YYYY-MM-DD", item.date);
        if (newDate === null) return;
        const dateValue = newDate.trim();
        if (!dateValue) return;

        const newCategory = prompt("Edit category: Work / Life", item.category || "Life");
        if (newCategory === null) return;
        const categoryValue = ["Work", "Life"].includes(newCategory.trim()) ? newCategory.trim() : item.category;

        const { error } = await db
          .from("events")
          .update({ title: titleValue, event_date: dateValue, category: categoryValue })
          .eq("id", item.id);

        if (error) return setStatus(`Event edit failed: ${error.message}`, true);

        const target = state.events.find(event => event.id === item.id);
        if (target) {
          target.title = titleValue;
          target.date = dateValue;
          target.category = categoryValue;
        }
        state.selectedDate = dateValue;
        el.eventDateInput.value = dateValue;
        renderCalendar();
      });

      deleteButton.addEventListener("click", async () => {
        const { error } = await db.from("events").delete().eq("id", item.id);
        if (error) return setStatus(`Event delete failed: ${error.message}`, true);
        state.events = state.events.filter(event => event.id !== item.id);
        renderCalendar();
      });
    }

    el.selectedEventsList.appendChild(node);
  });
}

function renderNotes() {
  el.notesList.innerHTML = "";
  el.notesCount.textContent = state.notes.length;

  state.notes.forEach(note => {
    const node = el.noteTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".note-title").textContent = note.title;
    node.querySelector(".note-body").textContent = note.body;
    node.querySelector(".note-date").textContent = formatLongDate(note.createdAt);

    node.querySelector(".note-edit").addEventListener("click", async () => {
      const newTitle = prompt("Edit note title", note.title);
      if (newTitle === null) return;
      const titleValue = newTitle.trim();
      if (!titleValue) return;

      const newBody = prompt("Edit note body", note.body);
      if (newBody === null) return;
      const bodyValue = newBody.trim();
      if (!bodyValue) return;

      const { error } = await db
        .from("notes")
        .update({ title: titleValue, body: bodyValue })
        .eq("id", note.id);

      if (error) return setStatus(`Note edit failed: ${error.message}`, true);

      note.title = titleValue;
      note.body = bodyValue;
      renderNotes();
    });

    node.querySelector(".note-delete").addEventListener("click", async () => {
      const { error } = await db.from("notes").delete().eq("id", note.id);
      if (error) return setStatus(`Note delete failed: ${error.message}`, true);
      state.notes = state.notes.filter(item => item.id !== note.id);
      renderNotes();
    });

    el.notesList.appendChild(node);
  });
}

function renderAll() {
  renderTasks();
  renderCalendar();
  renderNotes();
}


el.taskEditSheet.addEventListener("submit", async event => {
  event.preventDefault();

  const task = state.tasks.find(item => item.id === state.editingTaskId);
  if (!task) return closeTaskEditSheet();

  const titleValue = el.editTaskTitle.value.trim();
  if (!titleValue) return;

  const dateValue = el.editTaskDate.value || null;
  const priorityValue = el.editTaskPriority.value;

  const { error } = await db
    .from("tasks")
    .update({ title: titleValue, due_date: dateValue, priority: priorityValue })
    .eq("id", task.id);

  if (error) return setStatus(`Edit failed: ${error.message}`, true);

  task.title = titleValue;
  task.dueDate = dateValue || "";
  task.priority = priorityValue;

  closeTaskEditSheet();
  renderTasks();
});

el.taskEditClose.addEventListener("click", closeTaskEditSheet);
el.taskEditCancel.addEventListener("click", closeTaskEditSheet);

el.taskEditOverlay.addEventListener("click", event => {
  if (event.target === el.taskEditOverlay) closeTaskEditSheet();
});


el.taskForm.addEventListener("submit", async event => {
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

  const { data, error } = await db.from("tasks").insert(newTask).select().single();
  if (error) return setStatus(`Add failed: ${error.message}`, true);

  state.tasks.unshift({
    id: data.id,
    title: data.title,
    dueDate: data.due_date || "",
    priority: data.priority,
    category: data.category,
    done: data.done,
    createdAt: data.created_at
  });

  el.taskForm.reset();
  el.priorityInput.value = "Medium";
  setStatus("Synced with Supabase");
  renderTasks();
});

el.eventForm.addEventListener("submit", async event => {
  event.preventDefault();

  const newEvent = {
    title: el.eventTitleInput.value.trim(),
    event_date: el.eventDateInput.value,
    category: el.eventCategoryInput.value
  };

  const { data, error } = await db.from("events").insert(newEvent).select().single();
  if (error) return setStatus(`Event add failed: ${error.message}`, true);

  state.events.push({
    id: data.id,
    title: data.title,
    date: data.event_date,
    category: data.category,
    createdAt: data.created_at
  });

  state.selectedDate = data.event_date;
  el.eventForm.reset();
  el.eventDateInput.value = state.selectedDate;
  renderCalendar();
});

el.noteForm.addEventListener("submit", async event => {
  event.preventDefault();

  const newNote = {
    title: el.noteTitleInput.value.trim(),
    body: el.noteBodyInput.value.trim()
  };

  const { data, error } = await db.from("notes").insert(newNote).select().single();
  if (error) return setStatus(`Note add failed: ${error.message}`, true);

  state.notes.unshift({
    id: data.id,
    title: data.title,
    body: data.body,
    createdAt: data.created_at
  });

  el.noteForm.reset();
  renderNotes();
});

el.tabs.forEach(tab => {
  tab.addEventListener("click", () => switchView(tab.dataset.view));
});

el.refreshButton.addEventListener("click", loadAll);

el.prevMonthButton.addEventListener("click", () => {
  state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
  renderCalendar();
});

el.nextMonthButton.addEventListener("click", () => {
  state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
  renderCalendar();
});


let calendarTouchStartX = null;

el.calendarView.addEventListener("touchstart", event => {
  calendarTouchStartX = event.changedTouches[0].screenX;
}, { passive: true });

el.calendarView.addEventListener("touchend", event => {
  if (calendarTouchStartX === null) return;
  const endX = event.changedTouches[0].screenX;
  const diff = endX - calendarTouchStartX;

  if (Math.abs(diff) > 60) {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + (diff < 0 ? 1 : -1));
    renderCalendar();
  }

  calendarTouchStartX = null;
}, { passive: true });

el.eventDateInput.value = state.selectedDate;
loadAll();
