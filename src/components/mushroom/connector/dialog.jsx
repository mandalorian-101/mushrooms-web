import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import "./dialog.css";

const METHODS = [
    {
        text: "metamask",
        showText: "MetaMask"
    },
    {
        text: "walletconnect",
        showText: "WalletConnect"
    }
];

function CDialog({ open, onClose, active }) {

    function handleListItemClick(method) {
        onClose(method.text);
    }

    const handleClose = () => {
        onClose();
    };

    return <Dialog onClose={handleClose} open={open}>
        <List className="wallet-dialog" >
            {!active && METHODS.map((method) => (
                <ListItem className="wallet-option" button onClick={() => handleListItemClick(method)} key={method.text}>
                    <ListItemAvatar>
                        <img src={process.env.PUBLIC_URL + `/mushrooms/sourceicons/${method.text}.svg`} style={{ width: 30, height: 30 }} />
                    </ListItemAvatar>
                    <ListItemText primary={method.showText} />
                </ListItem>
            ))}
            {active && <ListItem className="wallet-option" button onClick={() => handleListItemClick({ text: "close" })}>
                <ListItemAvatar>
                    <LinkOffIcon />
                </ListItemAvatar>
                <ListItemText primary="Deactive" style={{ color: "red" }} />
            </ListItem>}
        </List>
    </Dialog>
}

export default CDialog;