import { Backdrop, CircularProgress } from "@material-ui/core";
import React from "react";


export default function CardBackDrop(props) {
    return <Backdrop open={props.open} className="card-back-drop">
        <CircularProgress color="inherit" />
    </Backdrop>
}