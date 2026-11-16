import { bookingUrl, bookingDays } from './booking.mjs';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); }
menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.querySelector('#all-services').addEventListener('click', e => {
  const button = e.currentTarget;
  const open = document.querySelector('.services-grid').classList.toggle('show-all');
  button.setAttribute('aria-expanded', String(open));
  button.firstChild.textContent = open ? 'Show fewer treatments ' : 'View all 10 treatments ';
  if (!open) document.querySelectorAll('.extra-service').forEach(card => card.open = false);
});
// Keep one animation active in browsers that do not support details[name].
const serviceCards = [...document.querySelectorAll('.service-card')];
serviceCards.forEach(card => card.addEventListener('toggle', () => {
  if (card.open) serviceCards.forEach(other => { if (other !== card) other.open = false; });
}));

const experience = document.querySelector('.treatment-experience');
const { steps, address } = window.clinicData;
let currentStep = 0;
let manualStep = false;
let playback;
function stopPlayback() { clearInterval(playback); playback=undefined; document.querySelector("#replay span").textContent="Play walkthrough"; document.querySelector("#replay").setAttribute("aria-label","Play root canal walkthrough"); }
function showStep(step) {
  currentStep = Math.max(0, Math.min(4, step));
  experience.dataset.step = String(currentStep);
  experience.querySelectorAll('.treatment-art').forEach((image,i) => { if (i===currentStep && !image.getAttribute('src')) image.src=image.dataset.src; image.classList.toggle('active',i===currentStep); image.setAttribute('aria-hidden',String(i!==currentStep)); });
  document.querySelector('#step-number').textContent = String(currentStep + 1).padStart(2, '0');
  document.querySelectorAll('.step-button').forEach((button, i) => {
    button.classList.toggle('active', i === currentStep);
    button.setAttribute('aria-pressed', String(i === currentStep));
  });
  const content = document.querySelector('#step-content');
  content.querySelector('h3').textContent = steps[currentStep].title;
  content.querySelector('p').textContent = steps[currentStep].text;
  document.querySelector('#step-prev').disabled = currentStep === 0;
  document.querySelector('#step-next').disabled = currentStep === 4;
}
document.querySelectorAll('.step-button').forEach(button => button.addEventListener('click', () => { manualStep = true; stopPlayback(); showStep(Number(button.dataset.step)); }));
document.querySelector('#step-prev').addEventListener('click', () => { manualStep = true; stopPlayback(); showStep(currentStep - 1); });
document.querySelector('#step-next').addEventListener('click', () => { manualStep = true; stopPlayback(); showStep(currentStep + 1); });
document.querySelector('#replay').addEventListener('click', () => {
  if (playback) { stopPlayback(); return; }
  manualStep=true; showStep(0);
  document.querySelector('#replay span').textContent='Pause walkthrough';
  document.querySelector('#replay').setAttribute('aria-label','Pause root canal walkthrough');
  playback=setInterval(() => { if (currentStep===4) stopPlayback(); else showStep(currentStep+1); },3000);
});
document.addEventListener('visibilitychange', () => { if(document.hidden) stopPlayback(); });
new IntersectionObserver(entries=>{ if(!entries[0].isIntersecting) stopPlayback(); }).observe(experience);
let touchX;
experience.querySelector('.treatment-visual').addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
experience.querySelector('.treatment-visual').addEventListener('touchend', e => {
  if (Math.abs(e.changedTouches[0].clientX - touchX) > 45) { manualStep = true; stopPlayback(); showStep(currentStep + (e.changedTouches[0].clientX < touchX ? 1 : -1)); }
}, { passive: true });
let scrollScheduled = false;
window.addEventListener('scroll', () => {
  if (scrollScheduled || manualStep || reducedMotion.matches || innerWidth < 900) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    scrollScheduled = false;
    const rect = document.querySelector('#treatments').getBoundingClientRect();
    const progress = (innerHeight * .68 - rect.top) / (rect.height * .65);
    if (progress >= 0 && progress <= 1.1) {
      const step = Math.min(4, Math.floor(Math.max(0, progress) * 5));
      if (step !== currentStep) showStep(step);
    }
  });
}, { passive: true });

const form = document.querySelector('#booking-form');
const dateInput = document.querySelector('#date');
const dayChoices = [...form.querySelectorAll('input[name="day"]')];
const todayChoice = document.querySelector('#day-today');
const tomorrowChoice = document.querySelector('#day-tomorrow');
const errorLabel = document.querySelector('#booking-error');
function refreshBookingDays() {
  const days = bookingDays();
  const previous = dayChoices.find(input => input.checked);
  const previousValue = previous?.value;
  todayChoice.value = days.today;
  todayChoice.disabled = days.todayClosed;
  tomorrowChoice.value = days.tomorrow;
  dateInput.min = days.minDate;
  if (previous && (previous.disabled || previous.value !== previousValue)) previous.checked = false;
  document.querySelector('#day-help').textContent = days.todayClosed ? 'Today’s clinic hours have ended. Please choose tomorrow or a later day.' : '';
}
function updateDayChoice() {
  const custom = document.querySelector('#day-custom').checked;
  document.querySelector('#custom-date-field').hidden = !custom;
  dateInput.disabled = !custom;
  dateInput.required = custom;
  errorLabel.textContent = '';
}
dayChoices.forEach(input => input.addEventListener('change', updateDayChoice));
form.addEventListener('focusin', refreshBookingDays);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshBookingDays(); });
refreshBookingDays();
form.addEventListener('submit', event => {
  event.preventDefault();
  errorLabel.textContent = '';
  refreshBookingDays();
  const selected = dayChoices.find(input => input.checked);
  if (!selected) { errorLabel.textContent = 'Please choose your preferred day.'; return; }
  try {
    const date = selected.value === 'custom' ? dateInput.value : selected.value;
    window.location.assign(bookingUrl({ name: form.elements.name.value, date }));
  } catch (error) {
    errorLabel.textContent = error.message;
  }
});
document.querySelector('#copy-address').addEventListener('click', async event => {
  const label = event.currentTarget.querySelector('span');
  try {
    await navigator.clipboard.writeText(address);
    label.textContent = 'Address copied';
  } catch {
    label.textContent = 'Select the address above to copy';
  }
  label.setAttribute('role', 'status');
});
document.querySelector('#load-map').addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.title = 'Google Maps address search for Shakuntala Dental Clinic in Mogal Bazar, Munger';
  iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent('Shakuntala Dental Clinic, D.N. Road, Mogal Bazar, Munger, Bihar 811202')}&output=embed`;
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;
  document.querySelector('#map-preview').replaceChildren(iframe);
});
const privacyDialog = document.querySelector('#privacy-dialog');
document.querySelector('.privacy-open').addEventListener('click', () => privacyDialog.showModal());
document.querySelector('#privacy-close').addEventListener('click', () => privacyDialog.close());
privacyDialog.addEventListener('click', event => { if (event.target === privacyDialog && event.clientX < privacyDialog.getBoundingClientRect().left) privacyDialog.close(); });

const stage = document.querySelector('#tooth-stage');
const motionButton = document.querySelector('#motion-toggle');
let paused=reducedMotion.matches, dragging=false, pointerStart=0, tiltStart=0, tilt=0;
function updateMotion() {
  stage.classList.toggle('motion-paused',paused);
  motionButton.setAttribute('aria-pressed',String(paused));
  motionButton.setAttribute('aria-label',paused?'Play tooth animation':'Pause tooth animation');
  motionButton.innerHTML=paused?'<span aria-hidden="true">▷</span>':'<span aria-hidden="true">Ⅱ</span>';
}
function setTilt(value,y=0) { tilt=Math.max(-15,Math.min(15,value));stage.style.setProperty('--tilt-y',`${tilt}deg`);stage.style.setProperty('--tilt-x',`${y}deg`); }
stage.addEventListener('pointerdown',e=>{dragging=true;pointerStart=e.clientX;tiltStart=tilt;stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{
  if(dragging) setTilt(tiltStart+(e.clientX-pointerStart)*.09);
  else if(e.pointerType==='mouse'&&!reducedMotion.matches) {const r=stage.getBoundingClientRect();setTilt(((e.clientX-r.left)/r.width-.5)*20,-((e.clientY-r.top)/r.height-.5)*10);}
});
stage.addEventListener('pointerup',()=>{dragging=false;});
stage.addEventListener('pointercancel',()=>{dragging=false;});
stage.addEventListener('pointerleave',()=>{if(!dragging)setTilt(0);});
stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setTilt(tilt+(e.key==='ArrowLeft'?-3:3));}});
motionButton.addEventListener('click',()=>{paused=!paused;updateMotion();});
reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;setTilt(0);updateMotion();});
updateMotion();

// Hover previews the same disclosure that remains keyboard and tap operable.
serviceCards.forEach(card=>card.addEventListener('pointerenter',event=>{
  if(event.pointerType==='mouse' && innerWidth>800 && !document.querySelector('.services-grid').classList.contains('show-all')) card.open=true;
}));
