import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import "./header.css";
import Connector from "../connector/connector";
import config from "../config";
import { Paper, Tab, Tabs } from "@material-ui/core";

function AppHeader(props) {

    function nav(event, newValue) {
        // e.preventDefault();
        // props.history.push(link);
        setValue(newValue);
        props.history.push(newValue);
    }
    const [value, setValue] = React.useState("/vaults");

    return <Paper square>
        <Tabs
            variant="fullWidth"
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={nav}
            aria-label="disabled tabs example"
        >
            <Tab label="Mushrooms Vaults" value={"/vaults"}/>
            <Tab label="Mushrooms Farms" value={"/farms"}/>
        </Tabs>
    </Paper>

    // return <div className="mushroom-header">
    //     <div className="mushroom-circle"></div>
    //     <div className="gap"></div>
    //     <div></div>
    //     <div className="main">
    //         <img className="logo" src={process.env.PUBLIC_URL + "/mushrooms/logo icon.png"} />
    //         <a className={`title ${currentPath == "/" ? "active" : ""}`} href="/" onClick={(e) => { nav(e, "/") }}>
    //             <img src={process.env.PUBLIC_URL + "/mushrooms/mushroom-2.png"} style={{ width: 200 }} />
    //         </a>

    //         {config.open &&
    //             <><a className={`nav ${currentPath == "/vaults" ? "active" : ""}`} href="/vaults" onClick={(e) => { nav(e, "/vaults") }}>VAULTS</a>
    //                 <a className={`nav ${currentPath == "/farms" ? "active" : ""}`} href="/farms" onClick={(e) => { nav(e, "/farms") }}>FARMS</a>
    //                 <a className={`nav ${currentPath == "/zaps" ? "active" : ""}`} href="/zaps" onClick={(e) => { nav(e, "/zaps") }}>ZAPS</a>
    //                 <Connector />
    //             </>
    //         }
    //     </div>

    // </div>
};

export default withRouter(AppHeader);