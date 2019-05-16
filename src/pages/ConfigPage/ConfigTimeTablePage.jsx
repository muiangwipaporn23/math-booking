import React, { Component } from 'react';
import { Form, Button, Icon, DatePicker, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { map, filter, isNil, get } from 'lodash';
import moment from 'moment';
import { Fetch, requestToApi } from 'react-data-fetching';
import Spinner from '../../components/Spinner/Spinner';
import UploadFile from '../../components/UploadFile/UploadFile';
import { API_HOST, TIMETABLE_STATUS } from '../../constant';

const config = {
  rules: [{ type: 'object', required: true, message: 'Please select time!' }],
};

class ConfigTimeTablePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config: this.props.config,
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields(async(err, value) => {
      if (!isNil(value)) {
        const startDate = moment(value.startDate).format('YYYY-MM-DD');
        const endDate = moment(value.endDate).format('YYYY-MM-DD');

        const { data } = await requestToApi({
          url: `${API_HOST}/config/timetable-range`,
          body: {
            startDate,
            endDate,
          },
          method: 'POST',
          timeout: 5000,
        });

        const status = get(data, 'status');
        const id = get(data, 'id');
        if (status) {
          const newConfig = {
            id,
            startDate,
            endDate,
          }
          this.setState(prevState => ({
            config: [...prevState.config, newConfig],
          }));
        }
      }
    });
  };

  onDelete = async (id) => {
    const { data } = await requestToApi({
      url: `${API_HOST}/config/timetable-range/${id}`,
      method: 'DELETE',
      timeout: 2500,
    });
    const status = get(data, 'status');
    if(status) {
      this.setState(prevState => ({
        config: filter(prevState.config, data => data.id !== id),
      }))
      message.success('ลบกิจกรรมสำเร็จ')
    }
    
  };

  renderInput = (getFieldDecorator) => (
    <div style={{display: 'flex', flexDirection: 'row', padding: '2% 10%', justifyContent: 'center'}}>
      <div style={{paddingTop: 10}}>ตั้งแต่ :</div>
      <Form.Item style={{width: '25%', margin: '0 5%'}}>
        {getFieldDecorator('startDate', config)(  
          <DatePicker style={{width: '100%'}} placeholder="กรุณาเลือกช่วงเวลา" format="YYYY-MM-DD" required />
        )}
      </Form.Item>
      <div style={{paddingTop: 10}}>ถึง :</div>
      <Form.Item style={{width: '25%', margin: '0 5%'}}>
        {getFieldDecorator('endDate', config)(  
          <DatePicker style={{width: '100%'}} placeholder="กรุณาเลือกช่วงเวลา" format="YYYY-MM-DD" required />
        )}
      </Form.Item>
      <div onClick={() => this.props.form.resetFields(['startDate', 'endDate'])} style={{cursor: 'pointer', paddingTop: 10}}>
        <Icon type="close" />
      </div>
    </div>
  );

  renderConfig = (id, startDate, endDate) => (
    <div key={id} style={{display: 'flex', flexDirection: 'row', padding: '2% 10%', justifyContent: 'center'}}>
      <div style={{paddingTop: 10}}>ตั้งแต่ :</div>
      <DatePicker style={{width: '25%', margin: '0 5%'}} defaultValue={moment(startDate, 'YYYY-MM-DD')} disabled />
      <div style={{paddingTop: 10}}>ถึง :</div>
      <DatePicker style={{width: '25%', margin: '0 5%'}} defaultValue={moment(endDate, 'YYYY-MM-DD')} disabled />
      <div onClick={async () => await this.onDelete(id)} style={{cursor: 'pointer', paddingTop: 10}}>
        <Icon type="delete" />
      </div>
    </div>
  );

  render() {
    const { getFieldDecorator } = this.props.form;
    const { history } = this.props;
    return (
      <div className="main-content" style={{margin: '5%'}}>
        <div style={{cursor: 'pointer'}} onClick={() => history.push('/settings')}>กลับสุ่เมนูหลัก</div>
        <div style={{fontSize: 22, textAlign: 'left', margin: '5% 0'}}>จัดการตารางเรียน</div>
        <div style={{display: 'flex', justifyContent: 'center', paddingBottom: '5%'}}>
          <UploadFile title="ไฟล์ตารางสอน" path="timetables/upload" />
        </div>
        {map(this.state.config, ({ id, startDate, endDate }) => this.renderConfig(id, startDate, endDate))}
        <Form onSubmit={this.handleSubmit}>
          {this.renderInput(getFieldDecorator)}
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Button style={{ backgroundColor: '#32CD32', color: 'white', width: '30%'}} htmlType="submit">ยืนยัน</Button>
          </div>
        </Form>
      </div>
    );
  }
}

const withConfigTimeTable = WrappedComponent => props => (
  <Fetch
    loader={<Spinner />}
    url={`${API_HOST}/config/timetable-range/${TIMETABLE_STATUS}`}
    timeout={10000}
  >
    {
      ({ data }) => ( <WrappedComponent {...props} config={data} /> )
    }
  </Fetch>
);

export default Form.create()(withConfigTimeTable(withRouter(ConfigTimeTablePage)));

