import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import MyDocument from './Component';
// Create Document Component
const TestPage = () => (
  <PDFViewer>
    <MyDocument />
  </PDFViewer>
);

export default TestPage;
