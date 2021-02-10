import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Switch,
  Route
} from "react-router-dom";
import IpfsRouter from 'ipfs-react-router'

import './i18n';

import MushRoomHome from './components/mushroom/home/home';
import MushRoomMain from './components/mushroom/main';
import Vaults from './components/mushroom/vaults/vaults';
import Farms from './components/mushroom/farms/farms';
import { BigNumber } from "bignumber.js";
import Zaps from './components/mushroom/zaps/zaps';
import { isApp } from './mushroomsStore';

let fmt = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: '',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: ''
}

// Set the global formatting options
BigNumber.config({ FORMAT: fmt })

let isAppEnv = isApp();
class App extends Component {
  state = {};


  render() {
    return (
      <>
        <CssBaseline />
        <IpfsRouter>
          <MushRoomMain>
            <>
              {isAppEnv && <Switch>
                <Route path="/vaults">
                  <Vaults />
                </Route>
                <Route path="/farms">
                  <Farms />
                </Route>
                <Route path="/">
                  <Vaults />
                </Route>
              </Switch>}
              {!isAppEnv && <Switch>
                <Route path="/vaults">
                  <Vaults />
                </Route>
                <Route path="/farms">
                  <Farms />
                </Route>
                <Route path="/zaps">
                  <Zaps />
                </Route>
                <Route path="/">
                  <MushRoomHome />
                </Route>
              </Switch>}
            </>
          </MushRoomMain>
        </IpfsRouter>
      </>
    );
  }
}

export default App;
