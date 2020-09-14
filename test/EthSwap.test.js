const Tuna = artifacts.require("Tuna");
const FishySwap = artifacts.require("FishySwap");

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n){
	return web3.utils.toWei(n, 'ether');
}


contract('FishySwap', ([deployer, investor]) => {
	let tuna, fishySwap


	before(async()=> {
		tuna = await Tuna.new()
		fishySwap = await FishySwap.new(tuna.address)
		//Transfert all tokens to ethswap
  		await tuna.transfer(fishySwap.address, tokens('1000000'))
	})

	describe('Token deployment', async() => {
		it('contract has a name', async() => {
		const name = await tuna.name()
		assert.equal(name, 'Tuna')
		})
	})


	describe('FishySwap deployment', async() => {

		it('contract has a name', async() => {
			const name = await fishySwap.name()
			assert.equal(name, 'FishySwap Instant Exchange')
		})

		it('contract has tokens', async()=> {
			let balance = await tuna.balanceOf(fishySwap.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('buyTokens()', async()=> {
		let result 

		before(async()=> {
			// Purchase tokens before each example
			result = await fishySwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
	})

		it('Allows users to instantly purchase token from ethswap for a fixed price', async()=>{
			let investorBalance = await tuna.balanceOf(investor)
			assert.equal(investorBalance.toString(), tokens('100'))

			//check balance eth
			let ethSwapBalance
			ethSwapBalance = await tuna.balanceOf(fishySwap.address)
			assert.equal(ethSwapBalance.toString(), tokens('999900'))
			ethSwapBalance = await web3.eth.getBalance(fishySwap.address)
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

			const event = result.logs[0].args
			assert.equal(event.account, investor)
			assert.equal(event.tuna, tuna.address)
			assert.equal(event.amount.toString(), tokens('100').toString())
			assert.equal(event.rate.toString(), '100')


		})

	})

	describe('sellTokens()', async() => {
		let result

		before(async() => {
			//investor must approuve the sell
			await tuna.approve(fishySwap.address, tokens('100'), {from: investor})
			// actually realize the sell
			result = await fishySwap.sellTokens(tokens('100'), {from: investor})
		})
		
		it('Allows user to instantly sell tokens to ethswap for a fixed price', async()=>{
				let investorBalance = await tuna.balanceOf(investor)
				assert.equal(investorBalance.toString(), tokens('0'))

				//check balance eth
				let ethSwapBalance
				ethSwapBalance = await tuna.balanceOf(fishySwap.address)
				assert.equal(ethSwapBalance.toString(), tokens('1000000'))
				ethSwapBalance = await web3.eth.getBalance(fishySwap.address)
				assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

				// check logs
				const event = result.logs[0].args
				assert.equal(event.account, investor)
				assert.equal(event.tuna, tuna.address)
				assert.equal(event.amount.toString(), tokens('100').toString())
				assert.equal(event.rate.toString(), '100')

				//FAILURE : double spend
				await fishySwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
		})

	})


})