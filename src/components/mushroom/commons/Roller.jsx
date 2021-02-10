import { Box } from "@material-ui/core";
import React from "react";

import "./Roller.css";

export default function Roller(props) {
    const [showClass, setShowClass] = React.useState("");
    const [showOld, setShowOld] = React.useState(true);

    const [first, setFirst] = React.useState(true);

    const updateTimer = React.useRef(null);
    const previousChildren = React.useRef(props.children);

    function setUpdate() {
        if (first) {
            setFirst(false);
            return;
        }
        setShowOld(true);
        setShowClass("hide");
        updateTimer.current = setTimeout(() => {
            updateTimer.current = null;
            setShowClass("show");
            setShowOld(false);
            previousChildren.current = props.children;
        }, 300);
    }

    React.useEffect(() => {
        return () => {
            if (updateTimer.current) {
                clearTimeout(updateTimer.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!updateTimer.current) {
            setUpdate();
        }
    }, [props.children]);

    return <Box {...props} className={`roller ${showClass}`}>{showOld ? previousChildren.current : props.children}</Box>;
}