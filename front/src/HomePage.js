import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import backUrl from './backUrl'
import credentialStore from './credentialStore'

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
  progress: {
    marginTop: theme.spacing.unit * 3,
  },
  progressContainer: {
    textAlign: "center",
  },
});

class HomePage extends React.Component {
  constructor(props) {
    super(props)

    const {username, password} = credentialStore.load()
    this.username = username
    this.password = password

    this.state = {
      toggling: false,
    }
  }

  onSubmit = (event) => {
    event.preventDefault()
    this.setState({toggling: true})
    const { username, password } = this
    credentialStore.save({username, password})
    console.log({username, password})
    fetch(backUrl("toggle"), {
      method: "POST",
      body: JSON.stringify({username, password}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.text())
      .then(response => {
        console.log(response)
      })
      .finally(() => {
        this.setState({toggling: false})
      })
  }

  onUsernameChange = (event, value) => {
    this.username = event.target.value
  }

  onPasswordChange = (event, value) => {
    this.password = event.target.value
  }

  render() {
    const { classes } = this.props
    const { toggling } = this.state
    const { username, password } = this

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            ACoLock
          </Typography>
          <form className={classes.form} onSubmit={this.onSubmit}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="username">Idenfiant</InputLabel>
              <Input id="username" name="username" autoComplete="username" autoFocus onChange={this.onUsernameChange} defaultValue={username} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Mot de passe</InputLabel>
              <Input name="password" type="password" id="password" autoComplete="current-password" onChange={this.onPasswordChange} defaultValue={password} />
            </FormControl>
            {toggling ?
              <div className={classes.progressContainer}>
                <CircularProgress className={classes.progress}/>
              </div>
              :
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={toggling}
              >
                Actionner la serrure
              </Button>
            }
          </form>
        </Paper>
      </main>
    );
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HomePage);
