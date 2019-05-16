import React from 'react';
import { Col, Row, Icon } from 'antd';
import { withRouter } from 'react-router-dom';
import UploadFile from '../../components/UploadFile/UploadFile';
import './SettingsPage.scss';

const SettingsPage = ({ history }) => (
  <Row className="main-content" style={{margin: '5%'}}>
    <div style={{marginBottom: '5%', fontSize: 22}}>ตั้งค่า</div>
    <Col span={12} style={{padding: '0 13%'}}>
      <div className="SettingPage__container" onClick={() => history.push('/settings/timetable')}>
        <div style={{padding: '10%'}}>
          <Icon type="dashboard" style={{fontSize: '50px'}} />
        </div>
        <div style={{fontSize: 16, paddingBottom: '20%'}}>จัดการ ตารางเรียน</div>
      </div>
    </Col>
    <Col span={12} style={{padding: '0 13%'}}>
      <div className="SettingPage__container" onClick={() => history.push('/settings/reservation')}>
        <div style={{padding: '10%'}}>
          <Icon type="clock-circle" style={{fontSize: '50px'}} />
        </div>
        <div style={{fontSize: 16, paddingBottom: '20%'}}>จัดการ การจอง-ใช้ห้อง</div>
      </div>
    </Col>
    <Col span={12} style={{ marginBottom: '5%', display: 'flex', justifyContent: 'center'}}>
      <UploadFile title="ไฟล์ผู้ใช้" path="/config/users"  />
    </Col>
    <Col span={12} style={{ marginBottom: '5%', display: 'flex', justifyContent: 'center'}}>
      <UploadFile title="ไฟล์ห้อง" path="/config/rooms" />
    </Col>
  </Row>
);

export default withRouter(SettingsPage);
