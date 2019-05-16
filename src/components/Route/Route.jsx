import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { Row, Col, Layout } from 'antd';
import { get, isNil } from 'lodash';
import { atob } from '../../utils/util';
import LeftNavbar from '../Menu/Menu';
import Header from '../Header/Header';
import RouteLayout from '../Layout/RouteLayout';
import Footer from '../Footer/Footer';


const PublicRoute = ({ component: Component }) => (
  <Layout>
    <div className="PublicLayout__navbar">
      <Header />
    </div>
    <Row>
      <Col span={6}>
        <LeftNavbar />
      </Col>
      <Col span={18}>
        <Route
          component={props => <RouteLayout><Component {...props} /></RouteLayout>}
        />
      </Col>
    </Row>
    <Footer />
  </Layout>
);

const privateLayOut = ({ component: Component,  history }) => {
  const userToken = localStorage.getItem('math-booking');
  if (isNil(userToken)) {
    history.push('/');
  } else {
    const decodeToken = atob(userToken) || {};
    const role = get(JSON.parse(decodeToken), 'role');

    if (role !== 'ADMIN' && role !== 'USER') {
      history.push('/');
    }
  }
  return (
    <Layout>
      <div className="PublicLayout__navbar">
        <Header />
      </div>
      <Row>
        <Col span={6}>
          <LeftNavbar />
        </Col>
        <Col span={18}>
          <Route
            component={props => <RouteLayout><Component {...props} /></RouteLayout>}
          />
        </Col>
      </Row>
      <Footer />
    </Layout>
  );
}

const adminLayout = ({ component: Component,  history }) => {
  const userToken = localStorage.getItem('math-booking');
  if (isNil(userToken)) {
    history.push('/');
  } else {
    const decodeToken = atob(userToken) || {};
    const role = get(JSON.parse(decodeToken), 'role');

    if (role !== 'ADMIN') {
      history.push('/');
    }
  }
  return (
    <Layout>
      <div className="PublicLayout__navbar">
        <Header />
      </div>
      <Row>
        <Col span={6}>
          <LeftNavbar />
        </Col>
        <Col span={18}>
          <Route
            component={props => <RouteLayout><Component {...props} /></RouteLayout>}
          />
        </Col>
      </Row>
      <Footer />
    </Layout>
  );
}

const PrivateLayOut = withRouter(privateLayOut);
const AdminLayOut = withRouter(adminLayout);

export {
  PublicRoute,
  PrivateLayOut,
  AdminLayOut,
}