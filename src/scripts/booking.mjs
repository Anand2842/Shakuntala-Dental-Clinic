export function localDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function bookingDays(now = new Date()) {
  const today = localDate(now);
  const tomorrow = new Date(new Date(`${today}T00:00:00Z`).getTime() + 86400000).toISOString().slice(0, 10);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23' }).format(now));
  return { today, tomorrow, todayClosed: hour >= 19, minDate: hour >= 19 ? tomorrow : today };
}
export function bookingUrl({ name, date }, now = new Date()) {
  const cleanName = typeof name === 'string' ? name.trim().replace(/[\r\n]+/g, ' ') : '';
  if (!cleanName || cleanName.length > 80) throw new Error('Please enter your name (up to 80 characters).');
  const parsed = new Date(`${date}T00:00:00Z`);
  const { minDate, todayClosed } = bookingDays(now);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < minDate) {
    throw new Error(todayClosed ? 'Please choose tomorrow or a later day. The clinic has closed for today.' : 'Please choose today or a future date.');
  }
  const prettyDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parsed);
  const message = `Hello Shakuntala Dental Clinic,\nI would like to request an appointment.\nName: ${cleanName}\nPreferred day: ${prettyDate}\nPlease confirm availability.`;
  return `https://wa.me/916201049711?text=${encodeURIComponent(message)}`;
}
