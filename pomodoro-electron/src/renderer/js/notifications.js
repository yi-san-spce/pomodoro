/* ====== Notifications Module — Toast + Web Notification ====== */

let toastTimer = null;
const $toast = document.getElementById('toast');

function showToast(msg) {
  if (!$toast) return;
  clearTimeout(toastTimer);
  $toast.textContent = msg;
  $toast.classList.add('show');
  toastTimer = setTimeout(() => $toast.classList.remove('show'), 2500);
}

function notify(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '🍅', silent: true });
  }
  showToast(body || title);
}

function requestNotification() {
  if ('Notification' in window && Notification.permission === 'default') {
    document.addEventListener('click', function grant() {
      Notification.requestPermission();
      document.removeEventListener('click', grant);
    }, { once: true });
  }
}

requestNotification();
