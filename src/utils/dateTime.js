import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { split } from 'lodash';
import {
  RESERVATION_STATUS_PENDING,
  RESERVATION_STATUS_AFTER_HOUR,
  RESERVATION_STATUS_CONFIRM,
  RESERVATION_COLOR_AFTER_HOUR,
  RESERVATION_COLOR_CONFIRM,
  RESERVATION_COLOR_PENDING,
} from '../constant';

const moment = extendMoment(Moment);

const thaiDate = (date) => {
  const newDate = moment(date).add(543, 'year').calendar();
  return moment(new Date(newDate)).locale('TH').format('D MMMM YYYY');
}

const thaiTime = (date) => {
  const newDate = moment(date).add(543, 'year').calendar();
  return `${moment.utc(newDate).locale('TH').format('D MMMM YYYY')} ${dateTimeToTime(split(date, ' ')[1])}`;
}

const changeDate = (date, mode) => {
  switch(mode) {
    case 'plus': {
      const newDate = moment(date).add(1, 'day').calendar();
      return moment.utc(newDate).locale('TH').format('D MMMM YYYY');
    }
    case 'minus': {
      const newDate = moment(date).add(-1, 'day').calendar();
      return moment.utc(newDate).locale('TH').format('D MMMM YYYY');
    }
    default: {
      break;
    }
  }
}


const selectBgColor = (startTime, endTime) => {
  const bgColor = {
    [RESERVATION_STATUS_PENDING]: RESERVATION_COLOR_PENDING,
    [RESERVATION_STATUS_AFTER_HOUR]: RESERVATION_COLOR_AFTER_HOUR,
    [RESERVATION_STATUS_CONFIRM]: RESERVATION_COLOR_CONFIRM,
  };
  const currentDate = moment();
  const reserveDate = moment(startTime).format('YYYY-MM-DD');
  const reserveTimeRange = moment.range(startTime, endTime);
  const afterHoursTimeRange = moment.range(
    `${reserveDate} 17:00:01`,
    `${reserveDate} 21:00:00`,
  );
  const hours = moment(startTime).diff(currentDate, 'hours');

  if(afterHoursTimeRange.overlaps(reserveTimeRange)) {
    return { status: RESERVATION_STATUS_AFTER_HOUR, bgColor: bgColor[RESERVATION_STATUS_AFTER_HOUR] };
  } else if(hours <= 24) {
    return { status: RESERVATION_STATUS_PENDING, bgColor: bgColor[RESERVATION_STATUS_PENDING] };
  } else {
    return { status: RESERVATION_STATUS_CONFIRM, bgColor: bgColor[RESERVATION_STATUS_CONFIRM] };
  }
 };

const dateTimeToTime = (dateTime) => {
  const date = split(dateTime, ':');
  return `${date[0]}:${date[1]}`;
}

export {
  thaiDate,
  thaiTime,
  changeDate,
  selectBgColor,
  dateTimeToTime,
};