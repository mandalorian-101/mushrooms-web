import { withNamespaces } from "react-i18next";
import { Card, CardContent, Grid, Box } from "@material-ui/core";
import React, { Component, useEffect } from "react";
import { eventEmitter } from "../../../../mushroomsStore";
import { useWeb3React } from "@web3-react/core";
import Coingecko from "coingecko-api";
import config from "../../config";
import { useState } from "react";
import { BigNumber } from "bignumber.js";
import { getMMtokenPrice } from "../../../contract/apy";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";
import Carousel from 'react-material-ui-carousel'
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';


let coingecko = new Coingecko();


function Prices({ t }) {
    let [list, setList] = useState([]);
    let web3React = useWeb3React();
    let safeAppsSDK = useSafeAppsSDK();
    async function fetchData() {
        let list = await Promise.all(config.prices.map(async d => {
            if (d.showName === "MM") {
                return { ...d, price: new BigNumber(await getMMtokenPrice()).toFixed(2) };
            } else {
                let coinPriceResponse = await coingecko.simple.price({ ids: d.queryId, vs_currencies: "usd" });
                return { ...d, price: new BigNumber(coinPriceResponse.data[d.queryId].usd).toFixed(2) };
            }
        }));

        // coingecko.coins.list();
        setList(list);
    }

    useEffect(() => {
        let timer = 0;
        let func = () => {
            fetchData();
            timer = setInterval(fetchData, 30000);
        };
        if (web3React.active || safeAppsSDK.connected) {
            func();
        }
        else {
            eventEmitter.addListener("ON_CONNECTED", func);
        }
        eventEmitter.addListener("ACCOUNT_CHANGE", fetchData);
        return () => {
            clearInterval(timer);
            eventEmitter.removeListener("ON_CONNECTED", func);
            eventEmitter.removeListener("ACCOUNT_CHANGE", fetchData);
        }
    }, []);


    function splitArray(array, length) {
        var result = [];
        var len = array.length / length;
        for (let i = 0; i < len; i++) {
            result.push([]);
        }
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            var index = parseInt(i / length);
            result[index].push(element);
        }
        return result;
    }

    function subArray(array, start, end) {
        let newArray = [];
        for (let i = start; i < end; i++) {
            const element = array[i];
            newArray.push(element);
        }
        return newArray;
    }

    function appendArray(array,len){
        for (let i = array.length; i < len; i++) {
            array.push(null);
        }
        return array;
    }

    return <Card className="card" elevation={2}>
        <CardBackDrop open={list.length === 0} />
        <CardContent >
            <Box fontSize={30} color="#ff6e6e" fontWeight="0">{t("Home.Prices")}</Box>
            <div className="prices-table">
                {/* {list.length > 0 && subArray(list, 0, 1).map(d => <div className="price-row">
                    <img src={process.env.PUBLIC_URL + `/mushrooms/coinicon/${d.showName}.png`} className="coin-price-icon" />
                    <span>{d.showName}</span>
                    {d.showName === "MM" && <a href="https://app.uniswap.org/#/swap?inputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&outputCurrency=0xa283aa7cfbb27ef0cfbcb2493dd9f4330e0fd304" target="_blank" style={{ textDecoration: "none" }}><span className="buy-mm-btn">BUY MM</span></a>}
                    <span style={{ float: "right" }}>$<Roller component="span">{d.price}</Roller></span>
                </div>)} */}
                <Carousel className="prices-table-carousel">
                    {
                        splitArray(subArray(list, 1, list.length), 5).map(a => appendArray([...subArray(list, 0, 1), ...a],6)).map(l2 => <>
                            {l2.map(d => d?<div className="price-row">
                                <img src={process.env.PUBLIC_URL + `/mushrooms/coinicon/${d.showName}.png`} className="coin-price-icon" />
                                <span>{d.showName}</span>
                                {d.showName === "MM" && <a href="https://app.uniswap.org/#/swap?inputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&outputCurrency=0xa283aa7cfbb27ef0cfbcb2493dd9f4330e0fd304" target="_blank" style={{ textDecoration: "none" }}><span className="buy-mm-btn">BUY MM</span></a>}
                                <span style={{ float: "right" }}>$<Roller component="span">{d.price}</Roller></span>
                            </div>:<div className="price-row"></div>)}</>
                        )
                    }
                </Carousel>
            </div>
        </CardContent>
        {/* <CardContent>
            <Box fontSize={12} color="#ffa748" fontWeight="0">
                {t("Home.Source")}: &nbsp;
                <Box component="a" fontSize={12} color="rgba(228, 0, 0, 0.95)" href="https://www.coingecko.com" target="_blank">coingecko</Box>
            </Box>
        </CardContent> */}
    </Card>
}

export default withNamespaces()(Prices);