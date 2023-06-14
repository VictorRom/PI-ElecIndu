import { format } from 'date-fns';

export const formatByHour = (d) => format(new Date(d), 'HH') + 'h';
export const formatByHourNMins = (d) => format(new Date(d), 'HH:mm');
