const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger?.addEventListener('click', () => {
  const open = nav.classList.toggle('show');
  burger.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
      nav.classList.remove('show');
      burger.setAttribute('aria-expanded','false');
    }
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('contactForm');
const msg = document.getElementById('formMsg');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if(!data.name || !data.email || !data.message){
    msg.style.color = '#b00020';
    msg.textContent = 'Bitte alle Felder ausfüllen.';
    return;
  }
  await new Promise(r=>setTimeout(r, 400));
  msg.style.color = '#0f7b0f';
  msg.textContent = 'Danke! Wir melden uns in Kürze.';
  form.reset();
});
