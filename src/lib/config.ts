import { log } from './logger';

export interface WeekSchedule {
  start: Date;
  end: Date;
  week: number;
}

// NBA season started on October 24, 2023
export const TOTAL_WEEKS = 25

export const WEEK_SCHEDULE: WeekSchedule[] = [
  { start: new Date('2023-10-24'), end: new Date('2023-10-30'), week: 1 },
  { start: new Date('2023-10-31'), end: new Date('2023-11-06'), week: 2 },
  { start: new Date('2023-11-07'), end: new Date('2023-11-13'), week: 3 },
  { start: new Date('2023-11-14'), end: new Date('2023-11-20'), week: 4 },
  { start: new Date('2023-11-21'), end: new Date('2023-11-27'), week: 5 },
  { start: new Date('2023-11-28'), end: new Date('2023-12-04'), week: 6 },
  { start: new Date('2023-12-05'), end: new Date('2023-12-11'), week: 7 },
  { start: new Date('2023-12-12'), end: new Date('2023-12-18'), week: 8 }
];

export function getCurrentWeek(): number {
  const today = new Date();
  log('config', 'Calculating current week', { today: today.toISOString() });
  
  const currentWeek = WEEK_SCHEDULE.find(w => {
    const isInWeek = today >= w.start && today <= w.end;
    log('config', `Checking week ${w.week}`, {
      start: w.start.toISOString(),
      end: w.end.toISOString(),
      isInWeek
    });
    return isInWeek;
  });

  const week = currentWeek?.week || 6; // Default to week 6 if not found
  log('config', `Current week determined as ${week}`);
  return week;
}
