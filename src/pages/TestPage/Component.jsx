import React, { Component } from 'react';
import { Page, Document, StyleSheet } from '@react-pdf/renderer';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {
  Form, Icon, Input, Button,
} from 'antd';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

// Create Document Component
class MyDocument extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
    } = this.props.form;

    const userNameError = isFieldTouched('userName') && getFieldError('userName');
    const passwordError = isFieldTouched('password') && getFieldError('password');
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <Form.Item
              validateStatus={userNameError ? 'error' : ''}
              help={userNameError || ''}
            >
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: 'Please input your username!' }],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
              )}
            </Form.Item>
            <Form.Item
              validateStatus={passwordError ? 'error' : ''}
              help={passwordError || ''}
            >
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
              )}
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Page>
      </Document>
    );
  }

}

export default Form.create()(MyDocument);
