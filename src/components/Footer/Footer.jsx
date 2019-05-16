import React from 'react';
import { Layout } from 'antd';
import './Footer.scss';

const { Content } = Layout;

const Footer = () => (
  <Layout>
    <Content className="Footer__container">
      <div>ปัญหาเรื่องการจองขอใช้ห้อง หรือจองฉุกเฉิน โปรดติดต่อผู้ดูแลเปิด-ปิดห้อง/ชั้นโดยตรง</div>
      <div>ชั้น 6	ศิริมา	สมอาษา	โทร. 087 043 1778</div>
      <div>ชั้น 7	โสภา	แผ่นจินดา 	โทร. 095 267 7718</div>
      <div>ชั้น 8	จันทร์	แย้มสี	โทร. 092 686 2165</div>
      <div>ชั้น 9	สุภาภรณ์	วงศ์วราพันธ์	โทร. 089 209 3946</div>
      <div>ชั้น 10	จันทร์	แย้มสี	โทร. 092 686 2165</div>
      <div>ชั้น 13	ดวงกมล	เสียงเย็น	โทร. 082 683 5009, 087 102 8504</div>
      <div>ชั้น 14	สุภาภรณ์	วงศ์วราพันธ์	โทร. 089 209 3946</div>
    </Content>
  </Layout>
);

export default Footer;