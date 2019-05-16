import React from 'react';
import { Table, Tag, Row, Col } from 'antd';
import { isEmpty, isNil, map, omit, split } from 'lodash';
import { Fetch } from 'react-data-fetching';
import Spinner from '../../components/Spinner/Spinner';
import { API_HOST, TIMETABLE_PAGE_KEY } from '../../constant';
import { dateTimeToTime } from '../../utils/dateTime';
import './TimeTablePage.scss';

const columns = [{
  title: 'รหัสวิชา',
  dataIndex: 'subjectCode',
  key: 'subjectCode',
}, {
  title: 'ชื่อวิชา',
  dataIndex: 'courseTitle',
  key: 'courseTitle',
}, {
  title: 'ตอนเรียน',
  dataIndex: 'section',
  key: 'section',
}, {
  title: 'ประเภท',
  key: 'typeTeach',
  dataIndex: 'typeTeach',
  render: tags => {
    let color = tags.length > 5 ? 'geekblue' : 'green';
    if (tags === 'loser') {
      color = 'volcano';
    }
    return <Tag color={color} key={tags}>{tags}</Tag>;
  },
}, {
  title: 'วันที่เรียน',
  dataIndex: 'meetingDay',
  key: 'meetingDay',
}, {
  title: 'เวลา',
  dataIndex: 'duration',
  key: 'duration',
}, {
  title: 'ห้อง',
  dataIndex: 'roomName',
  key: 'roomName',
}, {
  title: 'อาจารย์ผู้สอน',
  dataIndex: 'instructor',
  key: 'instructor',
}];

const TimeTablePage = ({ data }) => (
  <div className="main-content" style={{margin: '5%'}}>
    <Row>
      <Col span={12}>
        <div className="TimeTablePage__title">ตารางเรียน</div>
      </Col>
    </Row>
    <Table rowKey="id" columns={columns} dataSource={data} />
  </div>
);

const withTimetable = WrappedComponent => props => {
  const subjectCode = sessionStorage.getItem(TIMETABLE_PAGE_KEY);
  if(!isNil(subjectCode)) {
    sessionStorage.removeItem(TIMETABLE_PAGE_KEY);
  }
  return (
    <Fetch
      loader={<Spinner />}
      url={isEmpty(subjectCode) ? `${API_HOST}/timetables` : `${API_HOST}/timetable/${subjectCode}`}
      timeout={10000}
    >
      {
        ({ data }) => {
        const timetables = map(data, timetable => ({
          ...omit(timetable, ['duration']),
          duration: `${dateTimeToTime(split(timetable.duration, ' - ')[0])} - ${dateTimeToTime(split(timetable.duration, ' - ')[1])}`,
        }));
        return <WrappedComponent {...props} data={timetables} />
        }
      }
    </Fetch>
  );
}
export default withTimetable(TimeTablePage);