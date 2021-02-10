import { Box, Card, CardContent, Grid } from "@material-ui/core";
import React, { Component } from "react";


import "./buildWithTheBest.css";

export default function BuildWithTheBest({ t }) {

    return <Grid container item >
        <Grid md={12}>
            <img src={`${process.env.PUBLIC_URL}/mushrooms/built-with-the-best.png`} className="text-center bwtb" />
            <p className="text-center bwtb-p2">
                Mushrooms infrastructure rely on the most powerful DeFi protocols
            </p>
        </Grid>
        <Grid container spacing={1} item md={12} style={{ marginTop: 20 }}>
            <Grid md={3} item>
                <Card className="bwtb-card  text-center" >
                    <CardContent >
                        <a href="https://www.curve.fi/" target="_blank">
                            <img src={`${process.env.PUBLIC_URL}/mushrooms/bwtb/curve.png`} />
                        </a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid md={3} item>

                <Card className="bwtb-card  text-center">
                    <CardContent >
                        <a href="https://uniswap.org/" target="_blank">
                            <img src={`${process.env.PUBLIC_URL}/mushrooms/bwtb/uniswap.png`} />
                        </a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid md={3} item>

                <Card className="bwtb-card  text-center">
                    <CardContent >
                        <a href="https://makerdao.com/" target="_blank">
                            <img src={`${process.env.PUBLIC_URL}/mushrooms/bwtb/makerdao.png`} />
                        </a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid md={3} item>

                <Card className="bwtb-card  text-center">
                    <CardContent >
                        <a href="https://compound.finance/" target="_blank">
                            <img src={`${process.env.PUBLIC_URL}/mushrooms/bwtb/compound.png`} />
                        </a>
                    </CardContent>
                </Card>
            </Grid>

            <Grid md={3} item>

                <Card className="bwtb-card  text-center">
                    <CardContent >
                        <a href="https://88mph.app" target="_blank">
                            <img src={`${process.env.PUBLIC_URL}/mushrooms/bwtb/88mph.png`} style={{}} />
                        </a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid md={3} item>
                <Card className="bwtb-card  text-center">
                    <CardContent >
                        <a href="https://chain.link/" target="_blank">
                            <img src={`${process.env.PUBLIC_URL}/mushrooms/bwtb/chainlink.svg`} />
                        </a>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Grid>
}