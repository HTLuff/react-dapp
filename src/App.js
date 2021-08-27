// EXTERNAL
import { useState } from 'react';
import { ethers } from 'ethers'
// CONTRACTS
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
// COMPONENTS
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
// ASSETS
import './App.css';
const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
    flexGrow: 1,
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 200,
    },
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 45,
  },
  gridRow: {
    marginBottom: 10,
  },
  gridCell: {
    marginRight: 5
  },
  card: {
    minWidth: 275,
    minHeight: 70,
    marginTop: 10
  }
}));

// 
// Update with the contract address logged out to the CLI when it was deployed 
// 
const greeterAddress = process.env.REACT_APP_GREETER_ADDRESS

function App() {
  // 
  // store greeting in local state
  // 
  const [greeting, setGreetingValue] = useState("")
  const [greetingFetch, setGreetingFetchValue] = useState("")
  const [greetingError, setGreetingError] = useState({status:false, message:""})
  const classes = useStyles();
  // 
  // request access to the user's MetaMask account
  // 
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // 
  // call the smart contract, read the current greeting value
  // 
  async function fetchGreeting() {
    setGreetingError({status: false,  message: ""})
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
        try {
          const data = await contract.greet()
          setGreetingFetchValue(data)
          console.log('data: ', data)
        } catch (err) {
          console.log("Error: ", err)
        }
      }    
    } catch (error) {
      console.log("ERROR: ", error)
      setGreetingError({status: true,  message: "Error fetching greeting."})
    }
  }

  // 
  // call the smart contract, send an update
  // 
  async function setGreeting() {
    setGreetingError({status: false,  message: ""})
    try {
      if (!greeting) return
      if (typeof window.ethereum !== 'undefined') {
        await requestAccount()
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
        const transaction = await contract.setGreeting(greeting)
        await transaction.wait()
        fetchGreeting()
      }
    } catch (error) {
      console.log("ERROR: ", error)
      setGreetingError({status: true,  message: "Error setting greeting."})
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <Typography className={classes.pos} variant="h5" component="h2">CrypYo 👋</Typography>
      <Grid container direction="column" justifyContent="center" alignItems="center" >
        <Grid className={classes.gridRow} container direction="row" justifyContent="center" alignItems="center" spacing={3}>
          <Button className={classes.gridCell} variant="contained" color="primary" onClick={fetchGreeting}>Fetch Greeting</Button>
          <Button variant="contained" color="primary" onClick={setGreeting}>Set Greeting</Button>
        </Grid>
        <form className={classes.root} noValidate autoComplete="off" onChange={e => setGreetingValue(e.target.value)}>
          <TextField error={greetingError.status} color="primary" id="standard-basic" label="Set Greeting" helperText={greetingError.message} />
        </form>
        <Card className={classes.card} variant="outlined">
          <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {greetingFetch}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      </header>
    </div>
  );
}

export default App;