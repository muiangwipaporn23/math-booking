import React from 'react';
import { Table, Row, Col } from 'antd';
import { filter, isNil, omit, map } from 'lodash';
import { Fetch } from 'react-data-fetching';
import Spinner from '../../components/Spinner/Spinner';
import { API_HOST, ACTIVITY_PAGE_KEY, RESERVATION } from '../../constant';
import { dateTimeToTime } from '../../utils/dateTime';
import './ActivityPage.scss';

const columns = [{
  title: 'วันที่',
  dataIndex: 'meetingDate',
  key: 'meetingDate',
}, {
  title: 'เวลาเริ่ม',
  dataIndex: 'startTime',
  key: 'startTime',
}, {
  title: 'เวลาสิ้นสุด',
  dataIndex: 'endTime',
  key: 'endTime',
}, {
  title: 'ห้อง',
  dataIndex: 'roomName',
  key: 'roomName',
}, {
  title: 'ผู้จอง',
  dataIndex: 'reserver',
  key: 'reserver',
}, {
  title: 'กิจกรรม',
  dataIndex: 'activityName',
  key: 'activityName',
}, {
  title: 'สถานะ',
  dataIndex: 'status',
  key: 'status',
}];

const searchByActivityName = (activities) => {
  const isNull = isNil(sessionStorage.getItem(ACTIVITY_PAGE_KEY));
  if(isNull) {
    return activities;
  }
  const pattern = new RegExp(`.*${sessionStorage.getItem(ACTIVITY_PAGE_KEY)}.*`);
  sessionStorage.removeItem(ACTIVITY_PAGE_KEY);
  return filter(activities, ({ activityName }) => pattern.test(activityName))
};

const ActivityPage = ({ activities }) => {
  const filteredActivities = searchByActivityName(activities);
  return (
    <div className="main-content" style={{margin: '5%'}}>
      <Row>
        <Col span={12}>
          <div className="ActivityPage__title">ตารางกิจกรรม</div>
        </Col>
      </Row>
      <Table rowKey="id" columns={columns} dataSource={filteredActivities} />
    </div>
  );
}

const withActivities = WrappedComponent => props => (
  <Fetch
    loader={<Spinner />}
    url={`${API_HOST}/activities`}
    timeout={10000}
  >
    {
      ({ data }) => {
        const activities = map(data.data, data => ({
          ...omit(data, ['status', 'startTime', 'endTime']),
          startTime: dateTimeToTime(data.startTime),
          endTime: dateTimeToTime(data.endTime),
          status: RESERVATION[data.status],
        }));
        return <WrappedComponent {...props} activities={activities} />;
      }
    }
  </Fetch>
);

export default withActivities(ActivityPage);