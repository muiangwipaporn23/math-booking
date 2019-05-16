import React from 'react';
import { Table, Row, Col } from 'antd';
import { isNil, filter, map, omit } from 'lodash';
import { Fetch } from 'react-data-fetching';
import Spinner from '../../components/Spinner/Spinner';
import { API_HOST, ROOM_PAGE_KEY, RESERVATION } from '../../constant';
import { dateTimeToTime } from '../../utils/dateTime';
import './RoomPage.scss';

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

const searchByRoom = (activities) => {
  const isSearch = isNil(sessionStorage.getItem(ROOM_PAGE_KEY));
  if(isSearch) { 
    return activities;
  }
  const pattern = new RegExp(`.*${sessionStorage.getItem(ROOM_PAGE_KEY)}.*`);
  sessionStorage.removeItem(ROOM_PAGE_KEY);
  return filter(activities, ({ roomName }) => pattern.test(roomName))
};

const RoomPage = ({ activities }) => {
  const filteredActivities = searchByRoom(activities);
  return (
    <div className="main-content" style={{margin: '5%'}}>
      <Row>
        <Col span={12}>
          <div className="RoomPage__title">ตารางการใช้ห้อง</div>
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

export default withActivities(RoomPage);