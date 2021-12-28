import React from 'react'
import { useQuery, gql, useMutation } from '@apollo/client'
import { withStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Slide from '@material-ui/core/Slide'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  TableSortLabel,
  TextField,
} from '@material-ui/core'

import Title from './Title'

const styles = (theme) => ({
  root: {
    maxWidth: 700,
    marginTop: theme.spacing(3),
    overflowX: 'auto',
    margin: 'auto',
  },
  table: {
    minWidth: 700,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 300,
  },
})

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

// const SEARCH_EMPLOYEE = gql`
//   query searchEmpoyee(
//     $term: String!
//   ) {
//     name
//       user_name
//       email
//       phone
//   }
// `

const GET_EMPLOYEE = gql`
  query employeesPaginateQuery(
    $first: Int
    $offset: Int
    $orderBy: [EmployeeSort]
    $filter: EmployeeWhere
  ) {
    employees(
      options: { limit: $first, skip: $offset, sort: $orderBy }
      where: $filter
    ) {
      name
      user_name
      email
      phone
    }
  }
`

const MERGE_EMPLOYEE = gql`
  mutation MergeEmployee(
    $name: String!
    $user_name: ID!
    $email: String
    $phone: String
  ) {
    mergeEmployee(
      name: $name
      user_name: $user_name
      email: $email
      phone: $phone
    ) {
      name
      user_name
      email
      phone
    }
  }
`
const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($user_name: ID!) {
    deleteEmployee(user_name: $user_name)
  }
`

function EmployeeList(props) {
  const { classes } = props
  const [open, setOpen] = React.useState(false)
  const [openAlert, setOpenAlert] = React.useState(false)
  const [order, setOrder] = React.useState('ASC')
  const [orderBy, setOrderBy] = React.useState('name')
  const [page] = React.useState(0)
  const [rowsPerPage] = React.useState(100)
  const [filterState, setFilterState] = React.useState({ empnameFilter: '' })
  const [bindName, setBindName] = React.useState('test')
  const [bindUserName, setBindUserName] = React.useState('test')
  const [bindEmail, setBindEmail] = React.useState('test')
  const [bindPhone, setBindPhone] = React.useState('test')

  const getFilter = () => {
    return filterState.empnameFilter.length > 0
      ? { name_CONTAINS: filterState.empnameFilter }
      : {}
  }

  const { loading, data, error } = useQuery(GET_EMPLOYEE, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      orderBy: { [orderBy]: order },
      filter: getFilter(),
    },
  })

  const [addEmployee, { merge_data, merging, merge_error }] = useMutation(
    MERGE_EMPLOYEE,
    {
      refetchQueries: () => [
        {
          query: GET_EMPLOYEE,
          variables: {
            first: rowsPerPage,
            offset: rowsPerPage * page,
            orderBy: { [orderBy]: order },
            filter: getFilter(),
          },
          fetchPolicy: 'cache-and-network',
          nextFetchPolicy: 'cache-first',
        },
      ],
    }
  )
  const [deleteEmployee, { delete_data }] = useMutation(DELETE_EMPLOYEE, {
    refetchQueries: () => [
      {
        query: GET_EMPLOYEE,
        variables: {
          first: rowsPerPage,
          offset: rowsPerPage * page,
          orderBy: { [orderBy]: order },
          filter: getFilter(),
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
      },
    ],
  })

  const handleSortRequest = (property) => {
    const newOrderBy = property
    let newOrder = 'DESC'
    if (orderBy === property && order === 'DESC') {
      newOrder = 'ASC'
    }

    setOrder(newOrder)
    setOrderBy(newOrderBy)
  }

  const handleFilterChange = (filterName) => (event) => {
    const val = event.target.value

    setFilterState((oldFilterState) => ({
      ...oldFilterState,
      [filterName]: val,
    }))
  }

  const handleAddEmployee = () => {
    setOpen(true)
    setBindName('')
    setBindUserName('')
    setBindEmail('')
    setBindPhone('')
  }
  const handleClickOpen = (e) => {
    setOpen(true)
    setBindName(e.name)
    setBindUserName(e.user_name)
    setBindEmail(e.email)
    setBindPhone(e.phone)
  }

  const handleClose = () => {
    setOpen(false)
    addEmployee({
      variables: {
        name: bindName,
        user_name: bindUserName,
        email: bindEmail,
        phone: bindPhone,
      },
    })
    console.log(merge_data)
  }

  const handleEditSave = () => {
    setOpen(false)
    addEmployee({
      variables: {
        name: bindName,
        user_name: bindUserName,
        email: bindEmail,
        phone: bindPhone,
      },
    })
    console.log(merge_data)
  }

  const handleEditCancel = () => {
    setOpen(false)
  }

  const handleAletYes = () => {
    setOpenAlert(false)
    deleteEmployee({
      variables: {
        user_name: bindUserName,
      },
    })
    console.log(delete_data)
  }

  const handleAlertNo = () => {
    setOpenAlert(false)
  }

  const handleClickDelete = (e) => {
    setOpenAlert(true)
    setBindUserName(e.user_name)
  }

  return (
    <Paper style={{ width: '100%', maxWidth: 'none', padding: '1%' }}>
      <Grid container spacing={2} style={{ padding: '1%' }}>
        <Grid item xs={4}>
          <Box>
            <Title>Employee List</Title>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="search"
            label="Employee Name Contains"
            className={classes.textField}
            value={filterState.empnameFilter}
            onChange={handleFilterChange('empnameFilter')}
            margin="normal"
            variant="outlined"
            type="text"
            style={{ marginTop: '0' }}
            InputProps={{
              className: classes.input,
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Box>
            <Fab
              variant="extended"
              size="medium"
              color="primary"
              aria-label="add"
              style={{ cursor: 'pointer' }}
              onClick={() => handleAddEmployee()}
            >
              <AddIcon sx={{ mr: 1 }} /> Add Employee
            </Fab>
          </Box>
        </Grid>
      </Grid>
      <Divider></Divider>

      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {!merging && merge_error && <p>Error</p>}
      {data && !loading && !error && (
        <Table
          className={classes.table}
          style={{ width: '98%', padding: '10%' }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                key="nameHeader"
                sortDirection={orderBy === 'name' ? order.toLowerCase() : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={order.toLowerCase()}
                    onClick={() => handleSortRequest('name')}
                  >
                    Name
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell key="userNameHeader">User Name</TableCell>
              <TableCell key="emailHeader">Email Address</TableCell>
              <TableCell key="phoneHeader">Phone Number</TableCell>
              <TableCell key="editHeader"></TableCell>
              <TableCell key="deleteHeader"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.employees.map((n) => {
              return (
                <TableRow key={n.user_name}>
                  <TableCell component="th" scope="row">
                    {n.name}
                  </TableCell>
                  <TableCell>{n.user_name}</TableCell>
                  <TableCell>{n.email}</TableCell>
                  <TableCell>{n.phone}</TableCell>
                  <TableCell>
                    <EditIcon
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleClickOpen(n)}
                    ></EditIcon>
                  </TableCell>
                  <TableCell>
                    <DeleteIcon
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleClickDelete(n)}
                    ></DeleteIcon>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      <Dialog
        open={open}
        onClose={() => handleEditCancel()}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add/Update Employee</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="email"
            value={bindName}
            onChange={(e) => setBindName(e.target.value)}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="user_ame"
            label="User Name"
            type="email"
            value={bindUserName}
            onChange={(e) => setBindUserName(e.target.value)}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            value={bindEmail}
            onChange={(e) => setBindEmail(e.target.value)}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="Phone Number"
            type="email"
            value={bindPhone}
            onChange={(e) => setBindPhone(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEditCancel()} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleEditSave()} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openAlert}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{'Alert'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure want to delete this employee ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertNo}>No</Button>
          <Button onClick={handleAletYes}>Yes</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default withStyles(styles)(EmployeeList)
