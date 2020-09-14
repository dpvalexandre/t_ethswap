import React, { Component } from 'react'
import Web3 from 'web3'
import FishySwap from '../abis/FishySwap.json'
import Tuna from '../abis/Tuna.json'
import Navbar from './Navbar'
import './App.css'
import Main from './Main'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ethBalance})


    //load tuna token
    const networkId = await web3.eth.net.getId()
    const TokenData = Tuna.networks[networkId]
    if(TokenData){
      const tuna = new web3.eth.Contract(Tuna.abi, TokenData.address)
      this.setState({tuna})
      let tunaBalance = await tuna.methods.balanceOf(this.state.account).call()
      this.setState({tunaBalance : tunaBalance.toString()})
    } else{
        window.alert('No tuna here, please switch to another network :)=')
    }
    //load contract
    const fishyData = FishySwap.networks[networkId]
    if(fishyData){
      const fishyswap = new web3.eth.Contract(FishySwap.abi, fishyData.address)
      this.setState({fishyswap})
    } else{
        window.alert('No swap here, please switch to another network.')
    }
    this.setState({loading : false})
  }

  async loadWeb3(){
    if (window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum brower detected. You should consider trying Metamask :)=')
    }
  }

  buyTokens =(etheramount) => {
    this.setState({loading :true})
    this.state.fishyswap.methods.buyTokens()
      .send({value : etheramount, from : this.state.account})
      .on('transactionHash', (hash) => {
        this.setState({loadig : false})
      })
  }

  sellTokens =(tokenAmount) => {
    this.setState({loading :true})
    this.state.tuna.methods.approve(this.state.fishyswap._address, tokenAmount)
      .send({from : this.state.account})
      .on('transactionHash', (hash) => {
        this.state.fishyswap.methods.sellTokens(tokenAmount).send({from : this.state.account})
          .on('transactionHash', (hash) => {
          this.setState({loadig : false})
        })
      })
  }


  constructor(props) {
    super(props)
    this.state = {
      account : '',
      tuna : {},
      fishyswap : {},
      ethBalance:'0',
      tunaBalance :'0',
      loading : true
    }  
  }



  render() {
    let content
    if (this.state.loading){
        content = <p id ="loader" className="text-center">Loading...</p>
    }else{
        content = <Main
          ethBalance ={this.state.ethBalance}
          tunaBalance ={this.state.tunaBalance}
          buyTokens = {this.buyTokens}
          sellTokens = {this.sellTokens}
        />
    }
    return (
      <div>
        <Navbar account = {this.state.account}/>
        <div className="container-fluid mt-5 p-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style ={{maxWidth :'600px'}}>
              <div className="content mr-auto ml-auto">

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
