import React, { Component, Fragment } from 'react';
import { Button, Modal, Input, Row, Col, Alert, Form, message } from 'antd';
import { isEmpty, map, forEach, filter, isNil, get, split } from 'lodash';
import { compose } from 'lodash/fp';
import ReactToPrint from 'react-to-print';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Fetch, requestToApi } from 'react-data-fetching';
import Scheduler, {
  SchedulerData,
  ViewTypes,
} from 'react-big-scheduler';
import {
  API_HOST,
  HOME_PAGE_KEY,
  RESERVATION_STATUS_PENDING,
  RESERVATION_STATUS_AFTER_HOUR,
  RESERVATION_STATUS_CONFIRM,
  RESERVATION_COLOR_PENDING,
  RESERVATION_COLOR_CONFIRM,
  RESERVATION_COLOR_TIMETABLE,
  TIMETABLE_STATUS,
} from '../../constant';
import Spinner from '../../components/Spinner/Spinner';
import { config, printFirstConfig, printLastConfig } from '../../utils/schedulerConfig';
import { thaiDate, selectBgColor, thaiTime } from '../../utils/dateTime';
import { atob } from '../../utils/util';
import './HomePage.scss';

const moment = extendMoment(Moment);

class HomePage extends Component {
  constructor(props) {
    super(props);
    let date = moment().format('YYYY-MM-DD');

    const activityStatus = {
      [RESERVATION_STATUS_PENDING]: 'กรุณาติดต่อเจ้าหน้าที่',
      [RESERVATION_STATUS_AFTER_HOUR]: 'นอกเวลาราชการ',
    };

    const dateSearch = sessionStorage.getItem(HOME_PAGE_KEY);
    if(!isNil(dateSearch)) {
      date = dateSearch === 'null' ? moment().format('YYYY-MM-DD') : moment(dateSearch).format('YYYY-MM-DD');
      sessionStorage.removeItem(HOME_PAGE_KEY);
    }
    const activities = filter(this.props.data, ({ reservation_type }) => reservation_type !== TIMETABLE_STATUS);
    const timetables = filter(this.props.data, ({ reservation_type }) => reservation_type === TIMETABLE_STATUS);
    const filteredActivities = map(activities, ({ bgColor, end, id, reservation_type, reserver, resourceId, start, title }) => ({
      bgColor,
      end,
      id,
      reservation_type,
      reserver,
      resourceId,
      start,
      title : reservation_type === RESERVATION_STATUS_CONFIRM ? `${title} ${reserver}` : activityStatus[reservation_type],
    }));
    const filteredTimetables = map(timetables, ({ bgColor, end, id, reservation_type, reserver, resourceId, start, title }) => ({
      bgColor,
      end,
      id,
      reservation_type,
      reserver,
      resourceId,
      start,
      title : `${title} ${reserver}`,
    }));

    const allActivities = [...filteredTimetables, ...filteredActivities];
    const schedulerData = new SchedulerData(date, ViewTypes.Day, false, false, config);
    schedulerData.localeMoment.locale('en');
    const rooms = map(this.props.rooms, ({ id, name, capacity, type, status }) => ({
      id,
      name: `${name} (${capacity} ที่นั่ง)`,
      capacity,
      type,
      status,
    }))
    schedulerData.setResources(rooms);
    schedulerData.setEvents(allActivities);

    this.state = {
      schedulerData: schedulerData,
      visible: false,
      newEventId: '',
      startTime: '',
      endTime: '',
      slotId: '',
      showError: false,
      events: allActivities,
      currentDate: (!isNil(dateSearch) && dateSearch !== 'null') ? moment(dateSearch): moment(),
      roomName: '',
      capacity: '',
      role: this.props.userRole,
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields( async(err, value) => {
      const userToken = localStorage.getItem('math-booking');
      const decodeToken = isNil(userToken) ? message.error('กรุณาล็อกอิน ก่อนทำรายการจอง') : atob(userToken);
      const userId = get(JSON.parse(decodeToken), 'id');
      const username = get(JSON.parse(decodeToken.toString('utf8')), 'firstName');

      if(!isEmpty(value.activityName)) {
        this.props.form.resetFields(['activityName', 'reserver']);
        const reserver = isNil(value.reserver) ? username : value.reserver
        const { schedulerData } = this.state;
        const { status, bgColor } = selectBgColor(this.state.startTime, this.state.endTime);

        const title = {
          [RESERVATION_STATUS_PENDING]: 'กรุณาติดต่อเจ้าหน้าที่',
          [RESERVATION_STATUS_AFTER_HOUR]: 'นอกเวลาราชการ',
          [RESERVATION_STATUS_CONFIRM]: `${value.activityName} ${reserver}`,
        };

        const newEvent = {
          id: this.state.newEventId,
          title: title[status],
          start: this.state.startTime,
          end: this.state.endTime,
          resourceId: this.state.slotId,
          bgColor,
        };
        
        schedulerData.addEvent(newEvent);

        this.setState( prevState => ({
          schedulerData,
          activityName: '',
          visible: false,
          showError: false,
          reserver: '',
          events: [...prevState.events, newEvent],
        }), async () => {
          await requestToApi({
            url: `${API_HOST}/activity/reserve`,
            body: {
              activityName: value.activityName,
              roomName: this.state.roomName,
              startDate: this.state.startTime,
              endDate: this.state.endTime,
              userId: userId,
              reserver: isNil(value.reserver) ? username : value.reserver,
            },
            method: 'POST',
            timeout: 10000,
          });
        });
        message.success('จองห้องสำเร็จ');
      } else {
        this.setState({ showError: true });
      }
    });
  };

  handleCancel = (e) => {
    this.setState({ visible: false, showError: false });
  }

  handlePrint = () => {
    this.setState( prevStage => ({
      isPrint: !prevStage.isPrint,
    }));
  }

  prevClick = (schedulerData)=> {
    schedulerData.prev();
    schedulerData.setEvents(this.state.events);
    this.setState(prevState => ({ 
      schedulerData, 
      currentDate: moment(prevState.currentDate).add(-1, 'days'),
    }))
}

  nextClick = (schedulerData)=> {
    schedulerData.next();
    schedulerData.setEvents(this.state.events);
    this.setState(prevState => ({ 
      schedulerData, 
      currentDate: moment(prevState.currentDate).add(1, 'days'),
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

  onVerifyTimeRange = (start, end, slotName) => {
    const currentTimeRange = moment.range(start, end);
    let isValid = false;

    for (const data of this.props.config) {
      const startDate = moment(data.startDate);
      const endDate = moment(data.endDate);
      const timeRange = moment.range(startDate, endDate);

      isValid = isValid || currentTimeRange.overlaps(timeRange);
    }
    return { isOk: isValid };
  }

  onCreateEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    let newFreshId = 0;
    const userToken = localStorage.getItem('math-booking');
    const eventOfRoom = filter(this.state.events, ({ resourceId }) => resourceId === slotId);
    const currentTimeRange = moment.range(start, end);
    let isOverlap = false;
    
    forEach(eventOfRoom, event => {
      const timeRange = moment.range(event.start, event.end);
      if(currentTimeRange.overlaps(timeRange)) {
        isOverlap = true;
      }
    })
    const { isOk } = this.onVerifyTimeRange(start, end, slotName);
    const filteredRoom = filter(this.props.rooms, ({ name }) => name === split(slotName, ' ')[0])[0];
    const roomStatus = get(filteredRoom, 'type');
    const { status } = selectBgColor(start, end);

    if (isOverlap) {
      message.error('ไม่สามารถจองห้องซ้อนกันได้ กรุณาเลือกใหม่อีกครั้ง');
    } else if(moment(start).format('dd') === 'Sa' || moment(start).format('dd') === 'Su') {
      message.error('ไม่สามารถจองห้องในวันเสาร์ หรือ วันอาทิตย์ได้ กรุณาเลือกใหม่อีกครั้ง');
    } else if(!isOk) {
      message.error('ไม่สามารถจองห้องในช่วงเวลานี้ได้ กรุณาเลือกใหม่อีกครั้ง');
    } else if(isNil(userToken)) {
      message.error('กรุณาล็อกอิน ก่อนทำรายการจอง');
    } else if(status === RESERVATION_STATUS_AFTER_HOUR && roomStatus !== 'AFTERHOURS') {
      message.error('ห้องนี้ไม่สามารถจองนอกเวลาราชการได้');
    } else if(get(filteredRoom, 'status') === 'CLOSE') {
      message.error('ขออภัย ห้องนี้ถูกปิดใช้งาน');
    } else {
      this.setState({
        newEventId: newFreshId,
        startTime: start,
        endTime: end,
        slotId: slotId,
        roomName: split(slotName, ' ')[0],
        capacity: get(filter(this.props.rooms, ({name}) => name === split(slotName, ' ')[0])[0], 'capacity'),
      }, () => this.showModal());
      schedulerData.events.forEach((item) => {
        if(item.id >= newFreshId)
          newFreshId = item.id + 1;
      });
    } 
  }
  renderActivityInput = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form.Item style={{margin: 0}}>
        {getFieldDecorator('activityName')(
          <Row>
            <Col span={4} className="title">
              <span>กิจกรรม :</span>
            </Col>
            <Col span={20} className="input">
              <Input placeholder="ระบุชื่อกิจกรรม" required allowClear />
            </Col>
          </Row>
        )}
      </Form.Item>
    );
  };

  renderReserverInput = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form.Item>
        {getFieldDecorator('reserver')(
          <Row>
            <Col span={4} className="title">
              <span>ผู้จองแทน :</span>
            </Col>
            <Col span={20} className="input">
              <Input placeholder="ระบุชื่อผู้จองแทน" allowClear />
            </Col>
          </Row>
        )}
      </Form.Item>
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
      className="HomePage__modal"
      title="ข้อมูลการจอง"
      visible={this.state.visible}
      onCancel={this.handleCancel}
      footer={[]}
    >
      <Form onSubmit={this.onSubmit}>
        {this.state.showError && <Alert message="กรุณาระบุชื่อของกิจกรรม" type="error" className="alert" showIcon />}
        {this.renderActivityInput()}
        {this.renderDisableInput('เริ่มจอง', thaiTime(this.state.startTime))}
        {this.renderDisableInput('สิ้นสุด', thaiTime(this.state.endTime))}
        <Col span={4}>ห้อง : </Col>
        <Col span={6} style={{marginBottom: 20}}>{split(this.state.roomName, ' ')[0]}</Col>
        <Col span={6}>จำนวนที่นั่ง : </Col>
        <Col span={8} style={{marginBottom: 20}}>{this.state.capacity}</Col>
        {this.renderReserverInput()}
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          className="button"
        >
          จอง
        </Button>
      </Form>
    </Modal>
  );
  
  renderSuggest = (color, title) => (
    <Fragment>
      <div style={{width: 25, height: 25, backgroundColor: color, marginRight: '1%'}} />
      <div style={{marginRight: '5%'}}>{title}</div>
    </Fragment>
  )
  renderDownloadButton = () => (
    <ReactToPrint
      trigger={() => <Button type="primary" className="HomePage__downloadButton">ดาวน์โหลดตาราง</Button>}
      content={() => this.componentRef}
      onBeforePrint={() => this.handlePrint()}
      closeAfterPrint={() => this.handlePrint()}
    />
  )
  renderSuggestMenu = () => (
    <div style={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', marginTop: '3%'}}>
      {this.renderSuggest(RESERVATION_COLOR_CONFIRM, 'กิจกรรม')}
      {this.renderSuggest(RESERVATION_COLOR_TIMETABLE, 'ตารางเรียน')}
      {this.renderSuggest(RESERVATION_COLOR_PENDING, 'กิจกรรมที่ต้องติดต่อเจ้าหน้าที่')}
      {this.state.role === 'ADMIN' && this.renderDownloadButton() }
    </div>
  )
  renderPrintTable = () => {
    const printFirstSchedulerData = new SchedulerData(this.state.currentDate, ViewTypes.Day, false, false, printFirstConfig);
    printFirstSchedulerData.localeMoment.locale('en');
    printFirstSchedulerData.setResources(this.props.rooms);
    printFirstSchedulerData.setEvents(this.state.events);

    const printLastSchedulerData = new SchedulerData(this.state.currentDate, ViewTypes.Day, false, false, printLastConfig);
    printLastSchedulerData.localeMoment.locale('en');
    printLastSchedulerData.setResources(this.props.rooms);
    printLastSchedulerData.setEvents(this.state.events);

    return (
      <div ref={el => (this.componentRef = el)} media="print">
        <div style={{ paddingTop: '5%'}}>
          <div style={{ textAlign: 'center' }}>{ thaiDate(this.state.currentDate) }</div>
          <Scheduler
            style={{ textAlign: 'center' }}
            schedulerData={printFirstSchedulerData}
            prevClick={this.prevClick}
            nextClick={this.nextClick}
            onSelectDate={this.onSelectDate}
            newEvent={this.onCreateEvent}
            onViewChange={this.onViewChange}
            eventItemClick={this.eventClicked}
          />
        </div>
        <div style={{ marginTop: '70%', paddingTop: '5%'}}>
          <div style={{ textAlign: 'center' }}>{ thaiDate(this.state.currentDate) }</div>
          <Scheduler
            style={{ textAlign: 'center' }}
            schedulerData={printLastSchedulerData}
            prevClick={this.prevClick}
            nextClick={this.nextClick}
            onSelectDate={this.onSelectDate}
            newEvent={this.onCreateEvent}
            onViewChange={this.onViewChange}
            eventItemClick={this.eventClicked}
          />
        </div>
      </div>
    )
  }
  render() {
    return (
      <div className="main-content HomePage__container">
        { this.renderModal() }
        <Row className="HomePage__header">
          <Col span={12}>
            <div style={{fontSize: 22, textAlign: 'left'}}>ตารางการจอง-ใช้ห้องรายวัน</div>
          </Col>
          <Col span={12}>
            <Alert message="กรุณา คลิกลาก ช่องตารางเวลาที่ท่านต้องการจอง" type="info" closeText="X" style={{textAlign: 'left'}} />
          </Col>
        </Row>
        {this.renderSuggestMenu()}
        <div style={{position: 'relative', left: '30vw', top: '45px'}}>{ thaiDate(this.state.currentDate) }</div>
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
        <div style={{display: 'none'}}>
          { this.state.role === 'ADMIN' && this.renderPrintTable() }
        </div>
      </div>
    );
  }
}

const withActivities = WrappedComponent => props => {
  return (
    <Fetch
      loader={<Spinner />}
      url={`${API_HOST}/reservations`}
      timeout={10000}
    >
      {
        ({ data }) => ( <WrappedComponent {...props} data={data} /> )
      }
    </Fetch>
  );
}

const withRooms = WrappedComponent => props => {
  return (
    <Fetch
      loader={<Spinner />}
      url={`${API_HOST}/rooms`}
      timeout={10000}
    >
      {
        ({ data }) => {
          const rooms = map(data, ({ id, roomName, capacity, type, status }) => ({
            id,
            name: roomName,
            capacity,
            type,
            status,
          }))
          return <WrappedComponent {...props} rooms={rooms} />;
        }
      }
    </Fetch>
  );
}

const withConfigTimetable = WrappedComponent => props => {
  return (
    <Fetch
      loader={<Spinner />}
      url={`${API_HOST}/config/timetable-range/TIMETABLE`}
      timeout={10000}
    >
      {
        ({ data }) => {
          return <WrappedComponent {...props} config={data} />;
        }
      }
    </Fetch>
  );
}

const withUserRole = WrappedComponent => props => {
  const userToken = localStorage.getItem('math-booking');
  let role = null;
  if(!isNil(userToken)) {
    const decodeToken = atob(userToken);
    role = get(JSON.parse(decodeToken), 'role');
  }
  return (
    <WrappedComponent {...props} userRole={role} />
  )
}

export default compose(
  withRooms,
  withActivities,
  withConfigTimetable,
  withUserRole,
  Form.create(),
  DragDropContext(HTML5Backend),
)(HomePage)