import React from 'react';
import { HashRouter, Switch } from 'react-router-dom';
import { PublicRoute, PrivateLayOut, AdminLayOut } from './components/Route/Route';
import HomePage from './pages/HomePage/HomePage';
import RoomPage from './pages/RoomPage/RoomPage';
import TimeTablePage from './pages/TimeTablePage/TimeTablePage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import ActivityPage from './pages/ActivityPage/ActivityPage';
import ReserverPage from './pages/ReserverPage/ReserverPage';
import WeekActiviesPage from './pages/WeekActiviesPage/WeekActiviesPage';
import ConfigTimeTablePage from './pages/ConfigPage/ConfigTimeTablePage';
import ConfigReservationPage from './pages/ConfigPage/ConfigReservationPage';

const AppRouter = () => (
  <HashRouter>
    <Switch>
      <PublicRoute exact path="/" component={HomePage} />
      <PublicRoute path="/room" component={RoomPage} />
      <PublicRoute exact path="/timetable" component={TimeTablePage} />
      <PublicRoute exact path="/activity" component={ActivityPage} />
      <PublicRoute exact path="/reserver" component={ReserverPage} />
      <PublicRoute exact path="/week-activies" component={WeekActiviesPage} />
      {/* private */}
      <PrivateLayOut exact path="/history" component={HistoryPage} />
      {/* admin */}
      <AdminLayOut exact path="/settings" component={SettingsPage} />
      <AdminLayOut exact path="/settings/timetable" component={ConfigTimeTablePage} />
      <AdminLayOut exact path="/settings/reservation" component={ConfigReservationPage} />
    </Switch>
  </HashRouter>
)
export default AppRouter;

