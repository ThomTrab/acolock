import React from 'react'
import PropTypes from 'prop-types'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined'
import MenuIcon from '@material-ui/icons/Menu'
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt'
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import backUrl from './backUrl'
import credentialStore from './credentialStore'
import Grid from '@material-ui/core/Grid'
import LockControlActionResult from './LockControlActionResult'
import UserManager from './UserManager'

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
  avatarOpen: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.primary.main,
  },
  avatarClosed: {
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
  successContainer: {
    textAlign: "center",
  },
  failureContainer: {
    textAlign: "center",
  },
  successAvatar: {
    margin: `${theme.spacing.unit}px auto`,
    backgroundColor: theme.palette.primary.main,
  },
  failureAvatar: {
    margin: `${theme.spacing.unit}px auto`,
    backgroundColor: theme.palette.error.main,
  },
  manageCodes: {
    textAlign: "right",
    marginTop: theme.spacing.unit * 2,
  },
})

class HomeMenuButton extends React.Component {
  state = {
    anchorEl: null,
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const { anchorEl } = this.state

    return (
      <div>
        <Button
          onClick={this.onMenuClick}
        >
          <MenuIcon/>
        </Button>
        <Menu
          id="home-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}>Profile</MenuItem>
          <MenuItem onClick={this.handleClose}>My account</MenuItem>
          <MenuItem onClick={this.handleClose}>Logout</MenuItem>
        </Menu>
      </div>
    )
  }
}

class HomePage extends React.Component {
  constructor(props) {
    super(props)

    const {username, password} = credentialStore.load()

    this.state = {
      toggling: false,
      remember: (username !== undefined),
      username,
      password,
    }
  }

  sendCommand = (command) => {
    this.setState({toggling: true, success: undefined, lastActionResult: undefined})
    const { username, password } = this.state
    const { remember } = this.state

    if (remember)
      credentialStore.save({username, password})
    else
      credentialStore.clear()

    fetch(backUrl(command), {
      method: "POST",
      body: JSON.stringify({username, password}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.text())
      .then(response => {
        this.setState({success: response === "ok", lastActionResult: response})
      })
      .catch(error => {
        this.setState({success: false, lastActionResult: "server_error"})
      })
      .finally(() => {
        this.setState({toggling: false})
        this.updateLockState()
      })
  }

  onOpenClick = (event) => {
    event.preventDefault()
    const { lockState } = this.state
    if (lockState === "open" && !window.confirm("La serrure semble être déjà ouverte. Êtes vous sûr\u00a0?"))
      return
    this.sendCommand("open")
  }

  onCloseClick = (event) => {
    event.preventDefault()
    const { lockState } = this.state
    if (lockState === "closed" && !window.confirm("La serrure semble être déjà fermée. Êtes vous sûr\u00a0?"))
      return
    this.sendCommand("close")
  }

  onUsernameChange = (event) => {
    this.setState({username: event.target.value})
  }

  onPasswordChange = (event) => {
    this.setState({password: event.target.value})
  }

  onRememberChange = (event, checked) => {
    this.setState({remember: checked})
  }

  componentDidMount() {
    this.timer = setInterval(this.updateLockState, 10000)
    this.updateLockState()
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  updateLockState = () => {
    fetch(backUrl("lock_state"))
      .then(response => response.text())
      .then(response => {
        this.setState({lockState: response})
      })
  }

  onMenuClick = () => {
    this.setState({menuOpen: true})
  }

  render() {
    const { classes } = this.props
    const {
      toggling,
      success,
      lockState,
      remember,
      lastActionResult,
      credentialsManagerOpen,
    } = this.state
    const { username, password } = this.state

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={lockState === "open" ? classes.avatarOpen : classes.avatarClosed}>
            { lockState === "open" && <LockOpenOutlinedIcon /> }
            { lockState === "closed" && <LockOutlinedIcon /> }
          </Avatar>
          <Typography component="h1" variant="h5">
            ACoLock
          </Typography>
          <form className={classes.form}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="username">Idenfiant</InputLabel>
              <Input id="username" name="username" autoComplete="username" autoFocus onChange={this.onUsernameChange} value={username} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Mot de passe</InputLabel>
              <Input name="password" type="password" id="password" autoComplete="current-password" onChange={this.onPasswordChange} value={password} />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" onChange={this.onRememberChange} checked={remember} />}
              label="Enregistrer"
            />
            {toggling ?
              <div className={classes.progressContainer}>
                <CircularProgress className={classes.progress}/>
              </div>
              :
              <div>
                <Grid container spacing={24}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                      disabled={toggling}
                      onClick={this.onOpenClick}
                    >
                      Ouvrir
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      className={classes.submit}
                      disabled={toggling}
                      onClick={this.onCloseClick}
                    >
                      Fermer
                    </Button>
                  </Grid>
                </Grid>
                <div className={classes.manageCodes}>
                  <UserManager {...{username, password}} />
                </div>
              </div>
            }
            <LockControlActionResult result={lastActionResult} />
          </form>
        </Paper>
      </main>
    )
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(HomePage)
