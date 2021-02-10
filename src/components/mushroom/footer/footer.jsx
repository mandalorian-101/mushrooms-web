import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import "./footer.css";
import config from "../config";

import BuildWithTheBest from "./buildWithTheBest";
import { Container } from "@material-ui/core";
function Footer(props) {

    return <>

        <Container style={{ zIndex: 1000, position: "relative", maxWidth: 1024 }}>
            <BuildWithTheBest />
        </Container>
        <div className="mushroom-footer">
            <a href="https://twitter.com/MushroomsFinan1" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/twitter.png"} className="l" />
            </a>
            <a href="https://discord.gg/azeHDXA4BF" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/discord.png"} className="l" />
            </a>
            <a href="https://mushroomsfi.medium.com" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/medium.png"} className="l" />
            </a>
            <a href="https://github.com/mushroomsforest/deployment" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/github.png"} className="l" />
            </a>
            {/* <a href="https://defipulse.com/defi-list" target="_blank">
            <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/defi.png"} />
        </a> */}
            <a href="https://duneanalytics.com/mushrooms/mushrooms-finance" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/dune.png"} />
            </a>
            <a href="https://debank.com/projects/mushrooms" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/debank-icon.png"} />
            </a>

            <a href="https://www.coingecko.com/en/coins/mm-token" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/coingecko.png"} />
            </a>

            <a href="https://coinmarketcap.com/currencies/mm-token/" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/cmc.png"} />
            </a>

            <a href="https://vfat.tools/mushrooms" target="_blank">
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/vfat.png"} />
            </a>

            <a href="https://immunefi.com/bounty/mushroom/" target="_blank" >
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/immune.png"} />
            </a>

            <a href="https://t.me/mushroomsfinance" target="_blank" >
                <img src={process.env.PUBLIC_URL + "/mushrooms/socialmediaicons/tg.png"} />
            </a>

        </div>
    </>
}

export default withRouter(Footer);