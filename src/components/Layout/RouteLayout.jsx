import React from 'react';
import { Layout } from 'antd';
import './RouteLayout.scss';

const { Content } = Layout;

const RouteLayout = ({ children }) => (
  <Layout>
    <Content>
      <div className="RouteLayout__children">
        {children}
      </div>
    </Content>
  </Layout>
);

export default RouteLayout;
