import { useState, type MouseEvent } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from '@mui/material';
import { AccountCircle, Logout, SwapHoriz } from '@mui/icons-material';

type AccountActionLabels = {
    menuLabel: string;
    switchAccount: string;
    logout: string;
    switchTitle: string;
    switchDescription: string;
    logoutTitle: string;
    logoutDescription: string;
    cancel: string;
    confirm: string;
};

type AccountActionsMenuProps = {
    labels: AccountActionLabels;
    onSwitchAccount: () => void | Promise<void>;
    onLogout: () => void | Promise<void>;
    disabled?: boolean;
};

type PendingAction = 'switch' | 'logout' | null;

/**
 * Small, reusable account-actions menu for Suwayomi WebUI.
 * Authentication/session cleanup and navigation stay with the caller so this
 * component does not assume a particular server authentication mode.
 */
export default function AccountActionsMenu({
    labels,
    onSwitchAccount,
    onLogout,
    disabled = false,
}: AccountActionsMenuProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [busy, setBusy] = useState(false);
    const menuOpen = Boolean(anchorEl);

    const closeMenu = () => setAnchorEl(null);

    const requestAction = (action: Exclude<PendingAction, null>) => {
        closeMenu();
        setPendingAction(action);
    };

    const cancelAction = () => {
        if (!busy) setPendingAction(null);
    };

    const confirmAction = async () => {
        if (!pendingAction || busy) return;

        setBusy(true);
        try {
            if (pendingAction === 'switch') {
                await onSwitchAccount();
            } else {
                await onLogout();
            }
            setPendingAction(null);
        } finally {
            setBusy(false);
        }
    };

    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const isSwitch = pendingAction === 'switch';

    return (
        <>
            <Button
                aria-label={labels.menuLabel}
                aria-controls={menuOpen ? 'account-actions-menu' : undefined}
                aria-haspopup="menu"
                aria-expanded={menuOpen ? 'true' : undefined}
                disabled={disabled}
                onClick={handleMenuOpen}
                startIcon={<AccountCircle />}
            >
                {labels.menuLabel}
            </Button>

            <Menu
                id="account-actions-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={closeMenu}
                MenuListProps={{ 'aria-label': labels.menuLabel }}
            >
                <MenuItem onClick={() => requestAction('switch')}>
                    <ListItemIcon><SwapHoriz fontSize="small" /></ListItemIcon>
                    <ListItemText>{labels.switchAccount}</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => requestAction('logout')}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    <ListItemText>{labels.logout}</ListItemText>
                </MenuItem>
            </Menu>

            <Dialog
                open={pendingAction !== null}
                onClose={cancelAction}
                aria-labelledby="account-action-dialog-title"
                aria-describedby="account-action-dialog-description"
            >
                <DialogTitle id="account-action-dialog-title">
                    {isSwitch ? labels.switchTitle : labels.logoutTitle}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="account-action-dialog-description">
                        {isSwitch ? labels.switchDescription : labels.logoutDescription}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelAction} disabled={busy}>
                        {labels.cancel}
                    </Button>
                    <Button onClick={confirmAction} disabled={busy} autoFocus>
                        {labels.confirm}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
