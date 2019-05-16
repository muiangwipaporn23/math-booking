import React from 'react';
import { Table, Row, Col } from 'antd';
import { isNil, filter, map, omit } from 'lodash';
import { Fetch } from 'react-data-fetching';
import Spinner from '../../components/Spinner/Spinner';
import { API_HOST, RESERVER_PAGE_KEY, RESERVATION } from '../../constant';
import { dateTimeToTime } from '../../utils/dateTime';
import './ReserverPage.scss';

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

const searchByReserver = (activities) => {
  const isSearch = isNil(sessionStorage.getItem(RESERVER_PAGE_KEY));
  if(isSearch) { 
    return activities;
  }
  const pattern = new RegExp(`.*${sessionStorage.getItem(RESERVER_PAGE_KEY)}.*`);
  sessionStorage.removeItem(RESERVER_PAGE_KEY);
  return filter(activities, ({ reserver }) => pattern.test(reserver))
};

const ReserverPage = ({ activities }) => {
  const filteredActivities = searchByReserver(activities);
  return (
    <div className="main-content" style={{margin: '5%'}}>
      <Row>
        <Col span={12}>
          <div className="ReserverPage__title">ตารางกิจกรรม</div>
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

export default withActivities(ReserverPage);