import React from 'react';
import { Spin } from 'antd';
import './Spinner.scss';

const Spinner = ({ isOverlay }) => (
  <div className={`Spinner__container ${isOverlay ? '' : 'main-content'}`}>
    <Spin />
  </div>
)

export default Spinner;
