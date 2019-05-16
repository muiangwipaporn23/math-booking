import React, { Component, Fragment } from 'react';
import { message, Upload, Icon } from 'antd';
import { get, last, split } from 'lodash';
import { requestToApi } from 'react-data-fetching'
import { API_HOST } from '../../constant';

const { Dragger } = Upload;

const getBase64 = (csv, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(csv);
}

class UploadFile extends Component {
  uploadProps = {
    name: 'file',
    multiple: false,
    className: 'avatar-uploader',
    listType: 'picture-card',
    action: `${API_HOST}/${this.props.path}`,
    headers: {
      authorization: 'authorization-text',
    },
    onStart() {
      message.warning('กำลังประมวลผล');
    },
    onSuccess() {
      message.success('อัพโหลดไฟล์สำเร็จ');
    },
    onError() {
      message.error('รูปแบบไฟล์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    },
    customRequest({ action, file, headers, onError, onSuccess }) {
      getBase64(file, async (dataUrl) => {
        const dataUri = last(split(dataUrl, 'base64,'));
        const response = await requestToApi({
          url: action,
          body: {
            dataUrl: `data:text/csv;base64,${dataUri}`,
          },
          headers,
          method: 'POST',
          onTimeout: () => message.error(`ไม่สามารถอัพโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง`),
          timeout: 10000,
        });
        const status = get(response, 'data.status');
        if(status) {
          onSuccess();
        } else {
          onError();
        }
      });
    },
  };
  
  render() {
    const { title } = this.props;
    return (
      <Fragment>
        <Dragger {...this.uploadProps} style={{padding: '10%'}}>
          <p className="ant-upload-drag-icon">
            <Icon type="file-excel" />
          </p>
          <p className="ant-upload-text">{title}</p>
          <p className="ant-upload-hint">คลิกหรือลาก เพื่อทำการอัพโหลดไฟล์</p>
        </Dragger>
      </Fragment>
    )
  }
}

export default UploadFile;
