import React, { Component, Fragment } from 'react';
import { Button, Modal, Input, Row, Col, Alert, Form, message } from 'antd';
import { isEmpty, map, forEach, filter } from 'lodash';
import { compose } from 'lodash/fp';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Fetch } from 'react-data-fetching';
import Scheduler, {
  SchedulerData,
  ViewTypes,
} from 'react-big-scheduler';
import { API_HOST } from '../../constant';
import Spinner from '../../components/Spinner/Spinner';
import { config } from '../../utils/schedulerConfig';
import { thaiDate } from '../../utils/dateTime';
import './WeekActiviesPage.scss';

const moment = extendMoment(Moment);
class WeekActiviesPage extends Component {
  constructor(props) {
    super(props);
    const resources = [{
      capacity: 0,
      floor: 0,
      id: 1,
      name: "8 เมษายน",
      status: "open",
      type: "afterhours",
    }, {
      capacity: 0,
      floor: 0,
      id: 2,
      name: "9 เมษายน",
      status: "open",
      type: "afterhours",
    }, {
      capacity: 0,
      floor: 0,
      id: 3,
      name: "10 เมษายน",
      status: "open",
      type: "afterhours",
    }, {
      capacity: 0,
      floor: 0,
      id: 4,
      name: "11 เมษายน",
      status: "open",
      type: "afterhours",
    }, {
      capacity: 0,
      floor: 0,
      id: 5,
      name: "12 เมษายน",
      status: "open",
      type: "afterhours",
    }];

    const dataSource = [{
      bgColor: "#FFD966",
      end: "2019-04-09 12:00:00",
      id: 17632,
      resourceId: 2,
      start: "2019-04-09 10:00:00",
      title: "2301217 ณัฏฐนาถ",
    }, {
      bgColor: "#FF6699",
      end: "2019-04-09 21:00:00",
      id: 17632,
      resourceId: 2,
      start: "2019-04-09 18:00:00",
      title: "นอกเวลาราชการ",
    }, {
      bgColor: "#FF6699",
      end: "2019-04-09 10:00:00",
      id: 17632,
      resourceId: 2,
      start: "2019-04-09 08:00:00",
      title: "ติดต่อเจ้าหน้าที่",
    }, {
      bgColor: "#663300",
      end: "2019-04-09 16:00:00",
      id: 17632,
      resourceId: 2,
      start: "2019-04-09 13:00:00",
      title: "สัมมนา อาธร",
    }];

    const date = moment().format('YYYY-MM-DD');
    const schedulerData = new SchedulerData(date, ViewTypes.Day, false, false, config);
    schedulerData.localeMoment.locale('en');
    schedulerData.setResources(resources);
    schedulerData.setEvents(dataSource);

    this.state = {
      schedulerData: schedulerData,
      visible: false,
      activityName: '',
      newEventId: '',
      startTime: '',
      endTime: '',
      slotId: '',
      showError: false,
      events: dataSource,
      currentDate: moment(),
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleOk = (e) => {
    if(!isEmpty(this.state.activityName)) {
      this.props.form.resetFields(['activity']);
      const { schedulerData } = this.state;
      const newEvent = {
        id: this.state.newEventId,
        title: this.state.activityName,
        start: this.state.startTime,
        end: this.state.endTime,
        resourceId: this.state.slotId,
        bgColor: '#663300',
      };
      
      schedulerData.addEvent(newEvent);

      this.setState( prevState => ({
        schedulerData,
        activityName: '',
        visible: false,
        showError: false,
        events: [...prevState.events, newEvent],
      }));
    } else {
      this.setState({ showError: true });
    }
  }

  handleCancel = (e) => {
    this.setState({ visible: false, showError: false });
  }

  prevClick = (schedulerData)=> {
    schedulerData.prev(7);
    schedulerData.setEvents(this.state.events);
    this.setState(prevState => ({ 
      schedulerData, 
      currentDate: moment(prevState.currentDate).add(-7, 'days'),
    }))
}

  nextClick = (schedulerData)=> {
    schedulerData.next(7);
    schedulerData.setEvents(this.state.events);
    this.setState(prevState => ({ 
      schedulerData, 
      currentDate: moment(prevState.currentDate).add(7, 'days'),
    }))
}

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(this.state.events);
    this.setState({ 
      schedulerData,
      currentDate: moment(date),
    })
  }

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(this.state.events);
    this.setState({ schedulerData });
  }

  eventClicked = e => {
    console.log(e);
  };

  onCreateEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    let newFreshId = 0;
    const eventOfRoom = filter(this.state.events, ({ resourceId }) => resourceId === slotId);

    const currentTimeRange = moment.range(start, end);
    let isOverlap = false;

    forEach(eventOfRoom, event => {
      const timeRange = moment.range(event.start, event.end);
      if(currentTimeRange.overlaps(timeRange)) {
        isOverlap = true;
      }
    })

    if(!isOverlap) {
      this.showModal();
      schedulerData.events.forEach((item) => {
        if(item.id >= newFreshId)
          newFreshId = item.id + 1;
      });

      this.setState({
        newEventId: newFreshId,
        startTime: start,
        endTime: end,
        slotId: slotId,
      });
    } else {
      message.error('ไม่สามารถจองห้องซ้อนกันได้ กรุณาเลือกใหม่อีกครั้ง');
    }
  }

  renderInput = (title, placeholder, variable, required) => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <Col span={4} className="title">
          <span>{`${title} :`}</span>
        </Col>
        <Col span={20} className="input">
          {getFieldDecorator(variable, {})(
            required ? 
              <Input placeholder={placeholder} onChange={e => this.setState({ activityName: e.target.value })} allowClear required /> :
              <Input placeholder={placeholder} onChange={e => this.setState({ activityName: e.target.value })} allowClear />
          )}
        </Col>
      </Form>
    );
  };

  renderDisableInput = (title, value) => (
    <Fragment>
      <Col span={4} className="title">
        <span>{`${title} :`}</span>
      </Col>
      <Col span={20} className="input">
        <Input value={value} disabled style={{color: 'black'}} />
      </Col>
    </Fragment>  
  );

  renderModal = () => (
    <Modal
      className="WeekActiviesPage__modal"
      title="ข้อมูลการจอง"
      visible={this.state.visible}
      onOk={this.handleOk}
      onCancel={this.handleCancel}
      footer={[
        <Button key="submit" type="primary" className="button" onClick={this.handleOk}>
          จอง
        </Button>,
      ]}
    >
      <Row>
        {this.state.showError && <Alert message="กรุณาระบุชื่อของกิจกรรม" type="error" className="alert" showIcon />}
        {this.renderInput('กิจกรรม', 'ระบุชื่อกิจกรรม', 'activity', true)}
        {this.renderDisableInput('เริ่มจอง', this.state.startTime)}
        {this.renderDisableInput('สิ้นสุด', this.state.endTime)}
        {/* <Col span={4}>
          ห้อง : 
        </Col>
        <Col span={20}>{this.state.roomName}</Col> */}
        {this.renderInput('จองแทน', 'ระบุชื่อผู้จองแทน', 'reserver', false)}
      </Row>
    </Modal>
  );
  
  render() {
    return (
      <div className="main-content WeekActiviesPage__container">
        { this.renderModal() }
        <Row className="WeekActiviesPage__header">
          <Col span={12}>
            <div style={{fontSize: 22, textAlign: 'left', margin: '5% 0'}}>ตารางการจอง-ใช้ห้องรายสัปดาห์</div>
            <Alert message="กรุณา คลิกลาก ช่องตารางเวลาที่ท่านต้องการจอง" type="info" closeText="X" style={{textAlign: 'left'}} />
          </Col>
          <Col span={12}>
            <Button type="primary" className="downloadButton">ดาวน์โหลดตาราง</Button>
          </Col>
        </Row>
        <Scheduler
          style={{ textAlign: 'center' }}
          schedulerData={this.state.schedulerData}
          prevClick={this.prevClick}
          nextClick={this.nextClick}
          onSelectDate={this.onSelectDate}
          newEvent={this.onCreateEvent}
          onViewChange={this.onViewChange}
          eventItemClick={this.eventClicked}
        />
      </div>
    );
  }
}

// const withActivities = WrappedComponent => props => {
//   return (
//     <Fetch
//       loader={<Spinner />}
//       url={`${API_HOST}reservations`}
//       timeout={10000}
//     >
//       {
//         ({ data }) => ( <WrappedComponent {...props} data={data} /> )
//       }
//     </Fetch>
//   );
// }

// const withRooms = WrappedComponent => props => {
//   return (
//     <Fetch
//       loader={<Spinner />}
//       url={`${API_HOST}rooms`}
//       timeout={10000}
//     >
//       {
//         ({ data }) => {
//           const rooms = map(data, ({ id, roomName }) => ({
//             id,
//             name: roomName,
//           }))
//           return <WrappedComponent {...props} rooms={rooms} />;
//         }
//       }
//     </Fetch>
//   );
// }

export default compose(
  // withRooms,
  // withActivities,
  Form.create(),
  DragDropContext(HTML5Backend),
)(WeekActiviesPage)