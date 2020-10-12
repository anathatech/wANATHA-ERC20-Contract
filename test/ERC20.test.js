const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const {
  shouldBehaveLikeERC20,
} = require('./ERC20.behavior');

const {
  shouldBehaveLikeERC20Burnable
} = require('./behaviors/ERC20Burnable.behavor')

const UpgradableCoin = artifacts.require('UpgradableCoin');

contract('ERC20', function (accounts) {
  const [ proxyAdmin, initialHolder, recipient, anotherAccount ] = accounts;

  const name = 'Wrapped Anatha';
  const symbol = 'wANATHA';

  const initialSupply = new BN('50000000000000000'); // 500 Million 8 decimal

  beforeEach(async function () {
    const options = {
        unsafeAllowCustomTypes: true,
    }

    let proxy  = await deployProxy(UpgradableCoin, [initialHolder], options);

    this.token = await UpgradableCoin.at(proxy.address)    
  });

  it('has a name', async function () {
    expect(await this.token.name()).to.equal(name);
  });

  it('has a symbol', async function () {
    expect(await this.token.symbol()).to.equal(symbol);
  });

  it('has 18 decimals', async function () {
    expect(await this.token.decimals()).to.be.bignumber.equal('8');
  });

  

  shouldBehaveLikeERC20('ERC20', initialSupply, initialHolder, recipient, anotherAccount);
  
  describe('decrease allowance', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      function shouldDecreaseApproval (amount) {
        describe('when there was no approved amount before', function () {
          it('reverts', async function () {
            await expectRevert(this.token.decreaseAllowance(
              spender, amount, { from: initialHolder }), 'ERC20: decreased allowance below zero'
            );
          });
        });

        describe('when the spender had an approved amount', function () {
          const approvedAmount = amount;

          beforeEach(async function () {
            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
          });

          it('emits an approval event', async function () {
            const { logs } = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

            expectEvent.inLogs(logs, 'Approval', {
              owner: initialHolder,
              spender: spender,
              value: new BN(0),
            });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('1');
          });

          it('sets the allowance to zero when all allowance is removed', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('0');
          });

          it('reverts when more than the full allowance is removed', async function () {
            await expectRevert(
              this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder }),
              'ERC20: decreased allowance below zero'
            );
          });
        });
      }

      describe('when the sender has enough balance', function () {
        const amount = initialSupply;

        shouldDecreaseApproval(amount);
      });

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.addn(1);

        shouldDecreaseApproval(amount);
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = initialSupply;
      const spender = ZERO_ADDRESS;

      it('reverts', async function () {
        await expectRevert(this.token.decreaseAllowance(
          spender, amount, { from: initialHolder }), 'ERC20: decreased allowance below zero'
        );
      });
    });
  });

  describe('increase allowance', function () {
    const amount = initialSupply;

    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

          expectEvent.inLogs(logs, 'Approval', {
            owner: initialHolder,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: initialHolder });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.addn(1);

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

          expectEvent.inLogs(logs, 'Approval', {
            owner: initialHolder,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: initialHolder });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS;

      it('reverts', async function () {
        await expectRevert(
          this.token.increaseAllowance(spender, amount, { from: initialHolder }), 'ERC20: approve to the zero address'
        );
      });
    });
  });

  describe('_mint', function () {
    const amount = new BN(50);
    it('rejects a null account', async function () {
      await expectRevert(
        this.token.mint(ZERO_ADDRESS, amount), 'ERC20: mint to the zero address'
      );
    });

    describe('for a non zero account', function () {
      beforeEach('minting', async function () {
        const { logs } = await this.token.mint(recipient, amount);
        this.logs = logs;
      });

      it('increments totalSupply', async function () {
        const expectedSupply = initialSupply.add(amount);
        expect(await this.token.totalSupply()).to.be.bignumber.equal(expectedSupply);
      });

      it('increments recipient balance', async function () {
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
      });

      it('emits Transfer event', async function () {
        const event = expectEvent.inLogs(this.logs, 'Transfer', {
          from: ZERO_ADDRESS,
          to: recipient,
        });

        expect(event.args.value).to.be.bignumber.equal(amount);
      });
    });
  });
  describe('pausable token', function () {
    describe('transfer', function () {
      it('allows to transfer when unpaused', async function () {
        await this.token.transfer(recipient, initialSupply, { from: initialHolder });

        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(initialSupply);
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.transfer(recipient, initialSupply, { from: initialHolder });

        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(initialSupply);
      });

      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause();

        await expectRevert(this.token.transfer(recipient, initialSupply, { from: initialHolder }),
          'ERC20Pausable: token transfer while paused'
        );
      });
    });

    describe('transfer from', function () {
      const allowance = new BN(40);

      beforeEach(async function () {
        await this.token.approve(anotherAccount, allowance, { from: initialHolder });
      });

      it('allows to transfer from when unpaused', async function () {
        await this.token.transferFrom(initialHolder, recipient, allowance, { from: anotherAccount });

        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(allowance);
        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(initialSupply.sub(allowance));
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.transferFrom(initialHolder, recipient, allowance, { from: anotherAccount });

        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(allowance);
        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(initialSupply.sub(allowance));
      });

      it('reverts when trying to transfer from when paused', async function () {
        await this.token.pause();

        await expectRevert(this.token.transferFrom(
          initialHolder, recipient, allowance, { from: anotherAccount }), 'ERC20Pausable: token transfer while paused'
        );
      });
    });

    describe('mint', function () {
      const amount = new BN('42');

      it('allows to mint when unpaused', async function () {
        await this.token.mint(recipient, amount);

        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
      });

      it('allows to mint when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.mint(recipient, amount);

        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
      });

      it('reverts when trying to mint when paused', async function () {
        await this.token.pause();

        await expectRevert(this.token.mint(recipient, amount),
          'ERC20Pausable: token transfer while paused'
        );
      });
    });

    describe('burn', function () {
      const amount = new BN('42');

      it('allows to burn when unpaused', async function () {
        await this.token.burn(amount, { from: initialHolder });

        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(initialSupply.sub(amount));
      });

      it('allows to burn when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.burn(amount, { from: initialHolder });

        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(initialSupply.sub(amount));
      });

      it('reverts when trying to burn when paused', async function () {
        await this.token.pause();

        await expectRevert(this.token.burn(amount, { from: initialHolder }),
          'ERC20Pausable: token transfer while paused'
        );
      });
    });
  });

  shouldBehaveLikeERC20Burnable(initialHolder, initialSupply, anotherAccount);

});