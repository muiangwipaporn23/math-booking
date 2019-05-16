import React, { Component } from 'react';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { Table, Icon, message, Popconfirm } from 'antd';
import { filter, get, isNil, map, omit } from 'lodash';
import { Fetch, requestToApi } from 'react-data-fetching';
import Spinner from '../../components/Spinner/Spinner';
import { API_HOST, RESERVATION } from '../../constant';
import { dateTimeToTime } from '../../utils/dateTime';

class HistoryPage extends Component {
  columns = [{
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
    title: 'ชื่อผู้จอง',
    dataIndex: 'reserver',
    key: 'reserver',
  }, {
    title: 'ชื่อกิจกรรม',
    dataIndex: 'activityName',
    key: 'activityName',
  }, {
    title: 'สถานะ',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'ยกเลิก',
    key: 'action',
    render: (text, record) => {
      const currentDate = moment();
      const hours = moment(`${record.meetingDate} ${record.startTime}`).diff(currentDate, 'hours');
      if (hours > 24) {
        return (
          <Popconfirm
            placement="leftBottom"
            title={`ต้องการลบการจอง ${record.activityName}`}
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
            onConfirm={async () => await this.onDelete(record.id)}
            okText="ยืนยัน"
            cancelText="ยกเลิก"
          >
            <Icon type="delete" />
          </Popconfirm>
        )
      }
    },
  }];

  constructor(props) {
    super(props);
    this.state = {
      dataSource: this.props.activities,
    }
  }

  onDelete = async (id) => {
    const { data } = await requestToApi({
      url: `${API_HOST}/activity/${id}`,
      method: 'DELETE',
      timeout: 2500,
    });

    const status = get(data, 'status');

    if(status) {
      this.setState(prevState => ({
        dataSource: filter(prevState.dataSource, record => record.id !== id),
      }));
      message.success('ลบกิจกรรมสำเร็จ')
    }
  };

  render() {
    return (
      <div className="main-content HomePage__container">
        <div style={{fontSize: '22px', marginBottom: '5%'}}>ประวัติการจอง</div>
        <Table rowKey="id" columns={this.columns} dataSource={this.state.dataSource} />
      </div>
    );
  }
}

const withUserHistory = WrappedComponent => props => {
  const userToken = localStorage.getItem('math-booking');
  if (isNil(userToken)) {
    props.history.push('/');
  } else {
    const decodeToken = atob(userToken) || {};
    const userId = get(JSON.parse(decodeToken), 'id');
    return (
      <Fetch
        loader={<Spinner />}
        url={`${API_HOST}/activity/user/${userId}`}
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
  }
  return <WrappedComponent {...props} />
};

export default withUserHistory(withRouter(HistoryPage));