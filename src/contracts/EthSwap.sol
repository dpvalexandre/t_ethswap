pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
	string public name = "EthSwap Instant Exchange";
	Token public token;
	uint public rate = 100;

	event TokensPurchased(
		address account,
		address token,
		uint amount,
		uint rate
		);

	event TokensSold(
		address account,
		address token,
		uint amount,
		uint rate
		);

	constructor(Token _token) public {
		token = _token;
	}

	function buyTokens() public  payable {
		// number of tokens to buy
		uint tokenAmount = msg.value * rate;
		// verify that the exchange smart contract has enough tokens
		require(token.balanceOf(address(this)) >= tokenAmount);

		token.transfer(msg.sender, tokenAmount);

		//emit an event
		emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
	}

	function sellTokens(uint _amount) public {

		//User can't sell more token than he have
		require(token.balanceOf(msg.sender) >= _amount );

		
		//calculate amount the amount of ether
		uint etherAmount = _amount / rate;

		// verify that the exchange smart contract has enough tokens
		require(address(this).balance >= etherAmount);

		token.transferFrom(msg.sender, address(this), _amount);
		// Performs sell
		msg.sender.transfer(etherAmount);

		//emit an event
		emit TokensSold(msg.sender, address(token), _amount, rate);

	}




}