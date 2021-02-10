import { Card, CardContent, Grid, Box } from "@material-ui/core";
import React, { Component } from "react";
import { withNamespaces } from "react-i18next";
import { withRouter } from "react-router-dom";
import BalanceCard from "./cards/balance";
import MarketCapCard from "./cards/marketcap";
import FarmsCard from "./cards/farms";
import VaultsCard from "./cards/vaults";
import PricesCard from "./cards/prices";
import LockedCard from "./cards/locked";
import "./home.css";
import config from "../config";

function Home({ t }) {

    // apy = ss * mmprice
    //       --------------
    //       pollinfo.amount * poolinfo.lptoken.price

    //       pollinfo.amount  / poolinfo.lptokne.totalsupply * gql.reserveusd

    // vaults show balance  vault balanceof  show usd 
    // farms poolinfo.amount * price -> usd 
    // farms poolinfo.amount * price -> usd 
    // 


    // poolinfo.amount * price
    // 
    // poolinfo.amount * price


    //market cap total supply = mmtoken.ttsp

    if (!config.open) {
        return <>
            <Grid container spacing={1} className="home">
                <Grid md={12} container item style={{height:400}}>
                    <p className="intro"> Coming Soon </p>
                </Grid>
            </Grid>
        </>
    }
    return <>
        <Grid container spacing={1} className="home">
            <Grid md={12} container item>
                <p className="intro">{t("Home.Intro")}</p>
            </Grid>
            <Grid md={7} container spacing={1} direction="row" item>
                <Grid md={12} item container spacing={1} direction="row" item>
                    <Grid item md={12}>
                        <BalanceCard />
                    </Grid>
                </Grid>
                <Grid md={12} item container spacing={1} direction="row" item>
                    <Grid md={6} item >
                        <MarketCapCard />
                    </Grid>
                    <Grid md={6} item>
                        <LockedCard />
                    </Grid>
                </Grid>
            </Grid>
            <Grid md={5} container item >
                <Grid md={12} item container spacing={1} direction="row" item>
                    <Grid item md={12}>
                        <PricesCard />
                    </Grid>
                </Grid>
            </Grid>
            <Grid md={12} container spacing={1} item>
                <Grid md={6} item>
                    <VaultsCard />
                </Grid>
                <Grid md={6} item>
                    <FarmsCard />
                </Grid>
            </Grid>
        </Grid>

    </>
};



export default withNamespaces()(withRouter(Home));