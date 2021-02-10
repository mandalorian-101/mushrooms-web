import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import "./header.css";
import Connector from "../connector/connector";
import config from "../config";



function Header(props) {


    function nav(e, link) {
        e.preventDefault();
        props.history.push(link);
    }
    let currentPath = window.location.pathname;

    return <div className="mushroom-header">
        <div className="mushroom-circle"></div>
        <div className="gap"></div>
        <div></div>
        <div className="main">
            <img className="logo" src={process.env.PUBLIC_URL + "/mushrooms/logo icon.png"} />
            <a className={`title ${currentPath == "/" ? "active" : ""}`} href="/" onClick={(e) => { nav(e, "/") }}>
                <img src={process.env.PUBLIC_URL + "/mushrooms/mushroom-2.png"} style={{ width: 200 }} />
            </a>

            {config.open &&
                <><a className={`nav ${currentPath == "/vaults" ? "active" : ""}`} href="/vaults" onClick={(e) => { nav(e, "/vaults") }}>VAULTS</a>
                    <a className={`nav ${currentPath == "/farms" ? "active" : ""}`} href="/farms" onClick={(e) => { nav(e, "/farms") }}>FARMS</a>
                    <a className={`nav ${currentPath == "/zaps" ? "active" : ""}`} href="/zaps" onClick={(e) => { nav(e, "/zaps") }}>ZAPS</a>
                    <Connector />
                </>
            }
        </div>

    </div>
};

export default withRouter(Header);