

// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const description = document.getElementById("description");
const priority = document.getElementById("priority");
const deadline = document.getElementById("deadline");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

// Load tasks from Local Storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "All";
let editId = null;

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add or Update Task
taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskData = {
        name: taskName.value.trim(),
        description: description.value.trim(),
        priority: priority.value,
        deadline: deadline.value
    };

    if (editId !== null) {

        const task = tasks.find(t => t.id === editId);

        task.name = taskData.name;
        task.description = taskData.description;
        task.priority = taskData.priority;
        task.deadline = taskData.deadline;

        editId = null;

        document.getElementById("submitBtn").textContent = "Add Task";

    } else {

        taskData.id = Date.now();
        taskData.completed = false;

        tasks.push(taskData);
    }

    saveTasks();
    displayTasks();
    taskForm.reset();
});

// Display Tasks
function displayTasks() {

    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    // Sort according to priority
    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Search and Filter
    const filteredTasks = sortedTasks.filter(task => {

        const matchesSearch =
            task.name.toLowerCase().includes(searchText);

        let matchesFilter = true;

        if (currentFilter === "Pending") {
            matchesFilter = !task.completed;
        }

        else if (currentFilter === "Completed") {
            matchesFilter = task.completed;
        }

        else if (currentFilter === "High") {
            matchesFilter = task.priority === "High" && !task.completed;
        }

        return matchesSearch && matchesFilter;
    });

    if (filteredTasks.length === 0) {

        taskList.innerHTML =
            '<p class="empty-message">No tasks found!</p>';

    }

    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className =
            `task-card ${task.priority.toLowerCase()}
            ${task.completed ? "completed" : ""}`;

        const title = document.createElement("h3");
        title.textContent = task.name;

        const desc = document.createElement("p");
        desc.textContent = task.description || "No description";

        const priorityText = document.createElement("p");
        priorityText.textContent = "Priority: " + task.priority;

        const date = document.createElement("p");
        date.textContent = "Deadline: " + task.deadline;

        // Complete Button
        const completeBtn = document.createElement("button");
        completeBtn.className = "complete-btn";
        completeBtn.textContent =
            task.completed ? "Undo" : "Complete";

        completeBtn.onclick = function() {
            toggleComplete(task.id);
        };

        // Edit Button
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";

        editBtn.onclick = function() {
            editTask(task.id);
        };

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.onclick = function() {
            deleteTask(task.id);
        };

        const actions = document.createElement("div");
        actions.className = "task-actions";

        actions.append(completeBtn, editBtn, deleteBtn);

        card.append(title, desc, priorityText, date, actions);

        taskList.appendChild(card);

    });

    updateDashboard();
}

// Mark Task as Completed
function toggleComplete(id) {

    const task = tasks.find(t => t.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    saveTasks();
    displayTasks();
}

// Edit Task
function editTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    taskName.value = task.name;
    description.value = task.description;
    priority.value = task.priority;
    deadline.value = task.deadline;

    editId = id;

    document.getElementById("submitBtn").textContent = "Update Task";

    taskForm.scrollIntoView({ behavior: "smooth" });
}

// Delete Task
function deleteTask(id) {

    if (confirm("Do you want to delete this task?")) {

        tasks = tasks.filter(t => t.id !== id);

        if (editId === id) {
            editId = null;
            taskForm.reset();
            document.getElementById("submitBtn").textContent = "Add Task";
        }

        saveTasks();
        displayTasks();
    }
}

// Update Dashboard
function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;
}

// Search Tasks
searchInput.addEventListener("input", displayTasks);

// Filter Tasks
document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = this.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        displayTasks();
    });
});

// Display saved tasks when website opens
displayTasks();
