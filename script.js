let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';


const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterContainer = document.getElementById('filter-buttons');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const themeToggleBtn = document.getElementById('theme-toggle');


function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', activeTheme);
  themeToggleBtn.textContent = activeTheme === 'dark' ? '☀️' : '🌙';
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);
  themeToggleBtn.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
});


function syncState() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}


function renderTasks() {
  todoList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <label class="todo-left">
        <input type="checkbox" class="toggle-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="todo-text">${escapeHTML(task.text)}</span>
      </label>
      <div class="actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    todoList.appendChild(li);
  });

  const activeCount = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
}


function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now(),
    text: text,
    completed: false
  });

  todoInput.value = '';
  syncState();
});


todoList.addEventListener('click', (e) => {
  const li = e.target.closest('.todo-item');
  if (!li) return;

  const taskId = Number(li.dataset.id);

  
  if (e.target.classList.contains('toggle-checkbox')) {
    tasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    syncState();
  }

  
  if (e.target.classList.contains('edit-btn')) {
    const targetTask = tasks.find(task => task.id === taskId);
    const updatedText = prompt('Edit your task:', targetTask.text);
    if (updatedText !== null && updatedText.trim() !== '') {
      tasks = tasks.map(task =>
        task.id === taskId ? { ...task, text: updatedText.trim() } : task
      );
      syncState();
    }
  }

  
  if (e.target.classList.contains('delete-btn')) {
    tasks = tasks.filter(task => task.id !== taskId);
    syncState();
  }
});


filterContainer.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;

  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  currentFilter = e.target.dataset.filter;
  renderTasks();
});


clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  syncState();
});


initTheme();
renderTasks();

