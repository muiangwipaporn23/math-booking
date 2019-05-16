import React, { Component } from 'react';
import { Col, Row, Modal, Form, Input, Icon, Button, Dropdown, Menu, Alert, message } from 'antd';
import { get, isNil } from 'lodash';
import { requestToApi } from 'react-data-fetching'
import { withRouter } from 'react-router-dom';
import Logo from '../../../public/logo.png';
import { API_HOST } from '../../constant';
import { atob } from '../../utils/util';
import './Header.scss';

class Header extends Component {
  constructor(props) {
    super(props);
    const userToken = localStorage.getItem('math-booking');

    this.state = {
      visible: false,
      isLogin: !isNil(userToken),
      showError: false,
    }

  }

  handleSubmit = (e) => {
    e.preventDefault();
    Promise.all(
      this.props.form.validateFields(async (err, values) => {
        if (!err) {
          const { username, password } = values;
          const result = await this.onSignUp(username, password);
          if(result) {
            this.setState(prevState => ({
              visible: !prevState.visible,
              isLogin: true,
              showError: false,
            }));
          } else {
            this.setState({
              showError: true,
            })
          }
        }
      })
    );
  };

  onSignUp = async (username, password) => {
    const { data } = await requestToApi({
      url: `${API_HOST}/login`,
      body: {
        username,
        password,
      },
      method: 'POST',
      onTimeout: () => console.log('⏱️ Timeout!'),
      onProgress: (progression) => ('♻️ Progressing...', progression),
      // params: { page: 5, start: 0, limit: 20 },
      timeout: 2500,
    });
    
    const isOK = get(data, 'isOK');
    const token = get(data, 'token');

    if(isOK) {
      localStorage.setItem('math-booking', token);
      window.location.reload();
    }
    return isOK;
  }

  handleLogOut = () => {
    message.success('ออกจากระบบ');
    localStorage.clear();
    this.setState({ isLogin: false });
    this.props.history.push('/');
  };

  changeVisible = () => {
    const { resetFields } = this.props.form;
    resetFields(['username', 'password']);
    this.setState(prevState => ({
      visible: !prevState.visible,
      showError: false,
    }));
  }

  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        {this.state.showError && this.renderAlert()}
        <Form.Item className="Header__input">
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="ชื่อผู้ใช้" />
          )}
        </Form.Item>
        <Form.Item className="Header__input">
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'กรุณากรอกรหัสผ่าน' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="รหัสผ่าน" />
          )}
        </Form.Item>
        <Form.Item style={{display: 'block', textAlign: 'center'}}>
          <Button htmlType="submit" style={{width: '50%'}}>
            เข้าสู่ระบบ
          </Button>
        </Form.Item>
      </Form>
    );
  };

  renderAlert = () => (
    <Alert
      message="พบข้อผิดพลาด"
      description="ชื่อผู้ใช้หรือรหัสผ่าน ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
      type="error"
      showIcon
      style={{marginBottom: '5%'}}
    />
  );

  renderModal = () => (
    <Modal
      visible={this.state.visible}
      title="เข้าสู่ระบบ"
      onOk={this.handleOk}
      onCancel={this.changeVisible}
      footer={[]}
    >
      {this.renderForm()}
    </Modal>
  )

  renderMenu = () => (
    <Menu>
      <Menu.Item>
        <div onClick={() => this.props.history.push('/history')}>ประวัติการจอง</div>
      </Menu.Item>
      <Menu.Item>
        <div onClick={this.handleLogOut}>ออกจากระบบ</div>
      </Menu.Item>
    </Menu>
  );

  renderSignin = () => (
    <div className="menu" onClick={this.changeVisible}>
      เข้าสู่ระบบ
    </div>
  );

  renderDropdown = () => {
    const userToken = localStorage.getItem('math-booking');
    const decodeToken = atob(userToken) || {};
    const userName = get(JSON.parse(decodeToken), 'firstName');

    return (
      <div className="menu">
        <Dropdown overlay={this.renderMenu} trigger={['click']}>
          <div>
            {`สวัสดี คุณ ${userName}`} <Icon type="down" />
          </div>
        </Dropdown>
      </div>
    );
  };

  render() {
    return (
      <Row className="Header__container">
        {this.renderModal()}
        <Col offset={2} span={4}>
          <img src={Logo} alt="logo" className="img" />
        </Col>
        <Col span={12}>
          <div className="title">ภาคคณิตศาสตร์และวิทยาการคอมพิวเตอร์</div>
          <div className="subtitle">คณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย</div>
        </Col>
        <Col span={6}>
          <div className="content">ตารางการใช้ห้อง</div>
          { this.state.isLogin ? this.renderDropdown() : this.renderSignin() }
        </Col>
      </Row>
    );
  }
}

export default Form.create()(withRouter(Header));