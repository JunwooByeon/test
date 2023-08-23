import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, TextField, Snackbar } from '@material-ui/core';
import { SnackBarState } from './recoilHelper';
import { useRecoilState } from 'recoil';
import { getAllStudents, attendStudents, logging } from '../helper/db';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import MuiAlert from '@material-ui/lab/Alert';
import { ReactComponent as LoadingImage } from '../rolling.svg';
import './Override.css';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
    },
    status: { marginBottom: '20px', minHeight: '30px' },
    result: { marginBottom: '20px' },
    manualInput: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    dateText: {
        minWidth: '300px',
        maxWidth: '300px',
        margin: '0 auto 20px auto',
    },
    footer: {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        marginBottom: '20px',
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        marginBottom: '20px',
    },
    keypadButton: {
        borderRadius: '50%',
        height: '100px',
        width: '100px',
        fontSize: '40px',
    },
    textButton: {
        borderRadius: '50%',
        height: '100px',
        width: '100px',
        fontSize: '25px',
    },
    header: {
        minWidth: '300px',
        maxWidth: '300px',
        margin: '30px 15px 20px auto',
    },
    loader: {
        width: '100%',
        height: '100vh',
        position: 'absolute',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function AttendanceKeypad() {
    const classes = useStyles();
    const [snackBarState, setSnackBarState] = useRecoilState(SnackBarState);
    const [students, setStudents] = React.useState({});
    const [display, setDisplay] = React.useState('');
    const [manualStudent, setManualStudent] = React.useState('');
    const inputElement = useRef(null);
    const [date, setDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [loading, setLoading] = React.useState(false);

    const history = useHistory();

    // Snackbars
    const handleCloseError = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarState({ ...snackBarState, openError: false });
    };

    const handleCloseError2 = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarState({ ...snackBarState, openError2: false });
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarState({ ...snackBarState, openSuccess: false });
    };

    const handleCloseErrorField = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarState({ ...snackBarState, openErrorField: false });
    };

    useEffect(() => {
        const setAllStudents = async () => {
            const result = await getAllStudents();
            if (result === 'fail') {
                setSnackBarState({ ...snackBarState, openError: true });
            }
            const tempStudents = {};
            result.map((student) => {
                tempStudents[
                    student.id
                ] = `${student.firstname} ${student.lastname}`;
            });
            setStudents(tempStudents);
        };
        setAllStudents();

        if (inputElement.current) {
            inputElement.current.focus();
        }
    }, [setSnackBarState, snackBarState]);

    const handleChange = (value) => {
        setManualStudent(manualStudent + value);
        setDisplay(manualStudent + value);
    };

    const handleClear = () => {
        setManualStudent('');
        setDisplay('');
    };

    const handleManualScan = async () => {
        setLoading(true);
        let isExist = manualStudent in students;

        if (!isExist) {
            setDisplay(
                `Can't find the Student id ${manualStudent}. Please try again.`
            );
        } else {
            const result = await attendStudents(
                [{ id: manualStudent, name: students[manualStudent] }],
                date
            );
            if (result === 'fail') {
                setSnackBarState({
                    ...snackBarState,
                    openError: true,
                    openError2: false,
                    openSuccess: false,
                });
            }
            if (result === 'fail2') {
                setSnackBarState({
                    ...snackBarState,
                    openError: false,
                    openError2: true,
                    openSuccess: false,
                    messageOverride: students[manualStudent],
                });
            }
            if (result === 'success') {
                setSnackBarState({
                    ...snackBarState,
                    openSuccess: true,
                    openError: false,
                    openError2: false,
                    messageOverride: students[manualStudent],
                });
            }
            setDisplay('');
        }
        setLoading(false);
        setManualStudent('');
    };

    const handleDate = (e) => {
        setDate(e.target.value);
    };

    return (
        <div className={classes.root}>
            <Snackbar
                open={snackBarState.openSuccess}
                autoHideDuration={5000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleClose}
                    severity="info"
                    sx={{ fontSize: '20px' }}
                >
                    {`${snackBarState.messageOverride} attended!`}
                </Alert>
            </Snackbar>
            <Snackbar
                open={snackBarState.openError}
                autoHideDuration={5000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error">
                    Something went wrong. Please try again.
                </Alert>
            </Snackbar>
            <Snackbar
                open={snackBarState.openError2}
                autoHideDuration={5000}
                onClose={handleCloseError2}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error">
                    {`${snackBarState.messageOverride} already attended!`}
                </Alert>
            </Snackbar>

            {loading ? (
                <div className={classes.loader}>
                    <LoadingImage />
                </div>
            ) : null}

            <div className={classes.header}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                        history.push({
                            pathname: `/home`,
                        })
                    }
                >
                    Back
                </Button>
            </div>

            <TextField
                id="date"
                label="Date"
                type="date"
                InputLabelProps={{
                    shrink: true,
                }}
                onChange={(e) => handleDate(e)}
                value={date}
                className={classes.dateText}
            />
            <Typography variant="h5" gutterBottom className={classes.status}>
                {display}
            </Typography>

            <div className={classes.manualInput}>
                <div className={classes.buttonRow}>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('1')}
                    >
                        1
                    </Button>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('2')}
                    >
                        2
                    </Button>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('3')}
                    >
                        3
                    </Button>
                </div>
                <div className={classes.buttonRow}>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('4')}
                    >
                        4
                    </Button>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('5')}
                    >
                        5
                    </Button>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('6')}
                    >
                        6
                    </Button>
                </div>
                <div className={classes.buttonRow}>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('7')}
                    >
                        7
                    </Button>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('8')}
                    >
                        8
                    </Button>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('9')}
                    >
                        9
                    </Button>
                </div>
                
                <div className={classes.buttonRow}>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.textButton}
                        onClick={() => handleManualScan()}
                    >
                        Enter
                    </Button>
                    <Button
                        variant="contained"
                        color="default"
                        className={classes.keypadButton}
                        onClick={(e) => handleChange('0')}
                    >
                        0
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.textButton}
                        onClick={() => handleClear()}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}
