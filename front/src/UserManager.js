import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import AddIcon from '@material-ui/icons/Add'
import PersonIcon from '@material-ui/icons/Person'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import errorTranslator from './errorTranslator'

import backUrl from './backUrl'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

class User extends React.Component {
  constructor(props) {
    super(props)

    const { username, user, newUser } = props

    this.state = {
      open: false,
      admin: user && user.admin,
      password: "",
      loading: false,
    }
  }

  handleItemClick = () => {
    const { user } = this.props
    this.setState({
      open: true,
      admin: user && user.admin,
      password: "",
      username: "",
      loading: false,
    })
  }

  handleClose = (event) => {
    event.stopPropagation()
    this.setState({open: false, password: ""})
  }

  handleAdminChange = (event, checked) => {
    this.setState({admin: checked})
  }

  handlePasswordChange = (event) => {
    this.setState({password: event.target.value})
  }

  handleUsernameChange = (event) => {
    this.setState({username: event.target.value})
  }

  handleSubmit = (event) => {
    event.stopPropagation()
    const { username } = this.props
    const { admin, password, username: newUsername } = this.state
    this.setState({loading: true})
    this.props.onChange(username, {admin, password, username: newUsername})
      .then(() => {
        this.setState({open: false, password: ""})
      })
      .catch((error) => {
        alert(errorTranslator(error) || error)
        this.setState({loading: false})
      })
  }

  handleDialogClick = (event) => {
    event.stopPropagation()
  }

  render() {
    const { username, user, newUser } = this.props
    const { open, admin, password, username: newUsername, loading } = this.state

    return (
      <ListItem button onClick={this.handleItemClick}>
        <ListItemIcon>
         { newUser ? <AddIcon /> : <PersonIcon /> }
        </ListItemIcon>
        <ListItemText primary={newUser ? "Nouvel utilisateur" : username}/>
        <Dialog
          open={open}
          onClose={this.handleClose}
          onClick={this.handleDialogClick}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{newUser ? "Nouvel utilisateur" : username}</DialogTitle>
          <DialogContent>
            { newUser && (
              <TextField
                margin="dense"
                label="Nom d'utilisateur"
                type="text"
                fullWidth
                onChange={this.handleUsernameChange}
                value={newUsername}
                autoComplete="username"
              />
            )}
            <TextField
              margin="dense"
              id="password"
              label="Mot de passe"
              type="password"
              fullWidth
              onChange={this.handlePasswordChange}
              value={password}
              autoComplete="new-password"
            />
            <FormControlLabel
              label="Admin"
              control={
              <Checkbox
                checked={admin}
                onChange={this.handleAdminChange}
              />}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Annuler
            </Button>
            <Button disabled={loading} onClick={this.handleSubmit} color="primary">
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      </ListItem>
    )
  }
}

const UserList = ({users, onUserChange}) => {
  return (
    <List component="nav">
      <User key="new-user" newUser onChange={onUserChange} />
      {Object.keys(users).map((key) => (
        <User key={key} username={key} user={users[key]} onChange={onUserChange} />
      ))}
    </List>
  )
}

export default class UserManager extends React.Component {
  state = {
    open: false,
  }

  handleClickOpen = () => {
    this.setState({ open: true, loading: true, error: undefined, users: undefined })
    const {username, password} = this.props

    fetch(backUrl("users"), {
      method: "POST",
      body: JSON.stringify({username, password}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success)
          this.setState({loading: false, users: response.users})
        else
          this.setState({loading: false, error: response.error})
      })
      .catch(error => {
        this.setState({loading: false, error: error.message})
      })
  }

  handleClose = () => {
    this.setState({ open: false, error: undefined })
  }

  handleUserChange = (username, attributes) => {
    this.setState({ open: true, loading: true, error: undefined })
    const {username: currentUserUsername, password: currentUserPassword} = this.props
    return new Promise((resolve, reject) => {
      fetch(backUrl("update_user"), {
        method: "POST",
        body: JSON.stringify({
          username: currentUserUsername,
          password: currentUserPassword,
          user: {
            username,
            attributes,
          },
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            this.setState({loading: false, users: response.users})
            resolve()
          } else {
            this.setState({loading: false})
            reject(response.error)
          }
        })
        .catch(error => {
          this.setState({loading: false})
          reject(error)
        })
    })
  }

  render() {
    const {
      loading,
      users,
      error,
    } = this.state

    return (
      <div>
        <Button variant="text" onClick={this.handleClickOpen}>
          Gérer les accès
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Gestion des accès</DialogTitle>
          <DialogContent>
            { loading && (
                <Grid container justify = "center">
                  <CircularProgress/>
                </Grid>
            )}
            { error && (
              <DialogContentText>
                {errorTranslator(error)}
              </DialogContentText>
            )}
            { users && (
              <UserList users={users} onUserChange={this.handleUserChange} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}