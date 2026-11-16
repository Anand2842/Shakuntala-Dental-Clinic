import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingUrl, bookingDays, localDate } from '../src/scripts/booking.mjs';
const beforeClose = new Date('2026-11-16T13:29:59Z');
const closed = new Date('2026-11-16T13:30:00Z');
test('prepares only a name and preferred day with correct WhatsApp encoding', () => {
 const url=new URL(bookingUrl({name:' आरती & Rohan\nBharti ',date:'2026-11-16'},beforeClose));
 assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/916201049711');
 const text=url.searchParams.get('text');
 assert.match(text,/Name: आरती & Rohan Bharti/);assert.match(text,/Preferred day: 16 November 2026/);
 assert.match(text,/Please confirm availability\.$/);assert.doesNotMatch(text,/Treatment:|Preferred Time:|Area:|undefined/);
});
test('rejects missing names, long names, missing days, past and impossible dates',()=>{
 for(const invalid of [{name:undefined},{name:' '},{name:'x'.repeat(81)},{date:undefined},{date:''},{date:'2026-11-15'},{date:'2026-02-30'},{date:'2026-13-01'},{date:'2026-11-16\nInjected'}]){
  assert.throws(()=>bookingUrl({name:'Rohan',date:'2026-11-16',...invalid},beforeClose));
 }
});
test('today is permitted before closing and unavailable at 7 PM India time',()=>{
 assert.equal(bookingDays(beforeClose).minDate,'2026-11-16');
 assert.equal(bookingDays(closed).todayClosed,true);assert.equal(bookingDays(closed).minDate,'2026-11-17');
 assert.throws(()=>bookingUrl({name:'Rohan',date:'2026-11-16'},closed),/tomorrow/);
 assert.ok(bookingUrl({name:'Rohan',date:'2026-11-17'},closed));
});
test('date choices handle India midnight, opening hours, month/year and leap-day boundaries',()=>{
 assert.equal(localDate(new Date('2026-11-16T18:30:00Z')),'2026-11-17');
 assert.equal(bookingDays(new Date('2026-11-16T18:29:59Z')).minDate,'2026-11-17');
 assert.equal(bookingDays(new Date('2026-11-16T18:30:00Z')).todayClosed,false);
 assert.equal(bookingDays(new Date('2026-11-16T03:00:00Z')).minDate,'2026-11-16');
 for(const [date,tomorrow] of [['2026-11-30','2026-12-01'],['2026-12-31','2027-01-01'],['2028-02-28','2028-02-29'],['2028-02-29','2028-03-01']]){
  assert.equal(bookingDays(new Date(`${date}T06:00:00Z`)).tomorrow,tomorrow);
 }
 assert.ok(bookingUrl({name:'Rohan',date:'2028-02-29'},beforeClose));
});
