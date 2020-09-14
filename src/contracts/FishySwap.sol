pragma solidity ^0.5.0;

import "./Tuna.sol";

contract FishySwap {
	string public name = "FishySwap Instant Exchange";
	Tuna public tuna;
	uint public rate = 100;

	event TunaPurchased(
		address account,
		address tuna,
		uint amount,
		uint rate
		);

	event TunaSold(
		address account,
		address tuna,
		uint amount,
		uint rate
		);

	constructor(Tuna _tuna) public {
		tuna = _tuna;
	}

	function buyTokens() public  payable {
		// number of tokens to buy
		uint tunaAmount = msg.value * rate;
		// verify that the exchange smart contract has enough tokens
		require(tuna.balanceOf(address(this)) >= tunaAmount);

		tuna.transfer(msg.sender, tunaAmount);

		//emit an event
		emit TunaPurchased(msg.sender, address(tuna), tunaAmount, rate);
	}

	function sellTokens(uint _amount) public {

		//User can't sell more token than he have
		require(tuna.balanceOf(msg.sender) >= _amount );

		
		//calculate amount the amount of ether
		uint etherAmount = _amount / rate;

		// verify that the exchange smart contract has enough tokens
		require(address(this).balance >= etherAmount);

		tuna.transferFrom(msg.sender, address(this), _amount);
		// Performs sell
		msg.sender.transfer(etherAmount);

		//emit an event
		emit TunaSold(msg.sender, address(tuna), _amount, rate);

	}




}