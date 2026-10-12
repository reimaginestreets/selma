// Selma's home page: a greeting and a door to each journal.

const LIVE_KEY = 'selma-home.live';

const hour = new Date().getHours();
const partOfDay = hour < 5 ? 'evening' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
document.querySelector('#greeting').textContent = `Good ${partOfDay} · ${today}`;

// A journal marked data-check stays "on its way" until its site answers.
// The answer is remembered so the door stays open when offline.
function rememberedLive() {
  try {
    return JSON.parse(localStorage.getItem(LIVE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function setPending(card, pending) {
  card.classList.toggle('pending', pending);
  card.querySelector('.arrow').textContent = pending ? 'on its way' : '→';
  if (pending) {
    card.setAttribute('aria-disabled', 'true');
    card.tabIndex = -1;
  } else {
    card.removeAttribute('aria-disabled');
    card.removeAttribute('tabindex');
  }
}

for (const card of document.querySelectorAll('[data-check]')) {
  const name = card.dataset.check;
  setPending(card, !rememberedLive().includes(name));
  fetch(card.href, { method: 'HEAD', cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) return;
      setPending(card, false);
      localStorage.setItem(LIVE_KEY, JSON.stringify([...new Set([...rememberedLive(), name])]));
    })
    .catch(() => {});
}

// Lets the page open without a connection once it has been visited.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
