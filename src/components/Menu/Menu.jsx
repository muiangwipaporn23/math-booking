import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Fetch } from 'react-data-fetching';
import { Menu, Icon, Input, DatePicker, Select } from 'antd';
import { map, isEmpty, size, first, last, get, isNil } from 'lodash';
import Spinner from '../Spinner/Spinner';
import { ROLE_ADMIN, ROLE_STAFF, API_HOST, ROOM_PAGE_KEY } from '../../constant';
import { atob } from '../../utils/util';
import './Menu.scss';

const SubMenu = Menu.SubMenu;
const Search = Input.Search;
const Option = Select.Option;
const menuRoute = {
  menu1: '/',
  menu2: '/room',
  menu3: '/reserver',
  menu4: '/activity',
  menu5: '/timetable',
  menu6: '/settings',
};

class LeftMenu extends Component {
  rootSubmenuKeys = ['menu1', 'menu2', 'menu3', 'menu4', 'menu5', 'menu6'];

  constructor(props) {
    super(props);
    this.state = {
      openKeys: ['menu1'],
    }
  }
  handleSearch = (key, value) => {
    sessionStorage.setItem(key, value);
    this.props.history.push(menuRoute[key]);
  };

  renderSubMenu = (key, iconType, title, placeholder) => (
    <SubMenu 
      key={key} 
      title={<span><Icon type={iconType} /><span>{title}</span></span>}
    >
      <Menu.Item key="9">
        <Search
          placeholder={placeholder}
          onSearch={value => this.handleSearch(key, value)}
          style={{ width: '90%' }}
        />
      </Menu.Item>
    </SubMenu>
  );

  renderDateSubMenu = (key, iconType, title, placeholder, path) => (
    <SubMenu 
      key={key} 
      title={<span><Icon type={iconType} /><span>{title}</span></span>}
    >
      <Menu.Item key="9">
        <DatePicker
          placeholder={placeholder}
          style={{width: '90%'}}
          onChange={value =>this.handleSearch(key, value)}
        />
      </Menu.Item>
    </SubMenu>
  );

  renderRoomSubMenu = (key, iconType, title, placeholder, path) => (
    <SubMenu
      key={key} 
      title={<span><Icon type={iconType} /><span>{title}</span></span>}
    >
      <Menu.Item key="9">
        {this.renderSelect(this.props.rooms, 'ห้อง')}
      </Menu.Item>
    </SubMenu>
  );

  renderSelect = (datas, key) => (
    <Select
      showSearch
      onChange={value => this.handleSearch(ROOM_PAGE_KEY, value)}
      style={{ width: '90%', marginRight: 10 }}
      placeholder={`${key}ที่`}
      optionFilterProp="children"
      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    >
      {
        map(datas, data => ( <Option key="key" value={data}>{`${key} ${data}`}</Option> ))
      }
    </Select>
  );

  renderSettingMenu = (key, iconType, title) => (
    <SubMenu
      key={key} 
      title={<span><Icon type={iconType} /><span>{title}</span></span>}
    >
      <Menu.Item key="9">
      &nbsp;
      </Menu.Item>
    </SubMenu>
  );

  onOpenChange = (openKeys) => {
    sessionStorage.removeItem(this.state.openKeys[0]);
    if(!isEmpty(openKeys)) {
      const selectedMenu = size(openKeys) === 1 ? first(openKeys) : last(openKeys);
      this.props.history.push(menuRoute[selectedMenu]);
    }
    const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKeys });
    } else {
      this.setState({
        openKeys: latestOpenKey ? [latestOpenKey] : [],
      });
    }
  }

  render() {
    const userToken = localStorage.getItem('math-booking');
    const decodeToken = isNil(userToken) ? null : atob(userToken);
    const role = get(JSON.parse(decodeToken), 'role');

    return (
      <div className="Menu__leftMenuContainer">
        <div className="title">ค้นหา</div>
        <Menu
          openKeys={this.state.openKeys}
          onOpenChange={this.onOpenChange}
          style={{ width: '100%', marginTop: '10%'}}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['menu1']}
          mode="inline"
          forceSubMenuRender
        >
          { this.renderDateSubMenu('menu1', 'calendar', 'วันที่', 'กรุณาระบุวันที่') }
          { this.renderRoomSubMenu('menu2', 'table', 'ห้อง', 'กรุณาระบุเลขที่ห้อง') }
          { this.renderSubMenu('menu3', 'user', 'ชื่อผู้จอง', 'กรุณาระบุชื่อผู้จอง') } 
          { this.renderSubMenu('menu4', 'schedule', 'ชื่อกิจกรรม', 'กรุณาระบุชื่อกิจกรรม') } 
          { this.renderSubMenu('menu5', 'contacts', 'ตารางเรียน', 'กรุณาระบุรหัสวิชาเรียน') }
          { role === ROLE_ADMIN && this.renderSettingMenu('menu6', 'setting', 'ตั้งค่า') }
        </Menu>
      </div>
    );
  }
}

const withRooms = WrappedComponent => props => (
  <Fetch
    loader={<Spinner />}
    url={`${API_HOST}/rooms`}
    timeout={10000}
  >
    {
      ({ data }) => {
        const filteredRooms =  map(data, ({ roomName }) => roomName);
        return <WrappedComponent {...props} rooms={filteredRooms} />;
      }
    }
  </Fetch>
);


export default withRouter(withRooms(LeftMenu));
