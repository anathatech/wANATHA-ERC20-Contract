# Upgradable ERC20 token

## Install dependencies
```
npm install
```

## Tests

To run tests:
```
truffle develop

truffle(develop)> test
```

Output:
```
  Contract: ERC20
    ✓ has a name
    ✓ has a symbol
    ✓ has 18 decimals
    total supply
      ✓ returns the total amount of tokens
    balanceOf
      when the requested account has no tokens
        ✓ returns zero
      when the requested account has some tokens
        ✓ returns the total amount of tokens
    transfer
      when the recipient is not the zero address
        when the sender does not have enough balance
          ✓ reverts (215ms)
        when the sender transfers all balance
          ✓ transfers the requested amount (72ms)
          ✓ emits a transfer event
        when the sender transfers zero tokens
          ✓ transfers the requested amount (66ms)
          ✓ emits a transfer event
      when the recipient is the zero address
        ✓ reverts (71ms)
    transfer from
      when the token owner is not the zero address
        when the recipient is not the zero address
          when the spender has enough approved balance
            when the token owner has enough balance
              ✓ transfers the requested amount (64ms)
              ✓ decreases the spender allowance (51ms)
              ✓ emits a transfer event
              ✓ emits an approval event (52ms)
            when the token owner does not have enough balance
              ✓ reverts
          when the spender does not have enough approved balance
            when the token owner has enough balance
              ✓ reverts (42ms)
            when the token owner does not have enough balance
              ✓ reverts
        when the recipient is the zero address
          ✓ reverts
      when the token owner is the zero address
        ✓ reverts
    approve
      when the spender is not the zero address
        when the sender has enough balance
          ✓ emits an approval event
          when there was no approved amount before
            ✓ approves the requested amount (49ms)
          when the spender had an approved amount
            ✓ approves the requested amount and replaces the previous one (47ms)
        when the sender does not have enough balance
          ✓ emits an approval event (38ms)
          when there was no approved amount before
            ✓ approves the requested amount (49ms)
          when the spender had an approved amount
            ✓ approves the requested amount and replaces the previous one (43ms)
      when the spender is the zero address
        ✓ reverts
    decrease allowance
      when the spender is not the zero address
        when the sender has enough balance
          when there was no approved amount before
            ✓ reverts
          when the spender had an approved amount
            ✓ emits an approval event
            ✓ decreases the spender allowance subtracting the requested amount (45ms)
            ✓ sets the allowance to zero when all allowance is removed (45ms)
            ✓ reverts when more than the full allowance is removed
        when the sender does not have enough balance
          when there was no approved amount before
            ✓ reverts
          when the spender had an approved amount
            ✓ emits an approval event
            ✓ decreases the spender allowance subtracting the requested amount (43ms)
            ✓ sets the allowance to zero when all allowance is removed (45ms)
            ✓ reverts when more than the full allowance is removed
      when the spender is the zero address
        ✓ reverts
    increase allowance
      when the spender is not the zero address
        when the sender has enough balance
          ✓ emits an approval event
          when there was no approved amount before
            ✓ approves the requested amount (44ms)
          when the spender had an approved amount
            ✓ increases the spender allowance adding the requested amount (45ms)
        when the sender does not have enough balance
          ✓ emits an approval event
          when there was no approved amount before
            ✓ approves the requested amount (45ms)
          when the spender had an approved amount
            ✓ increases the spender allowance adding the requested amount (41ms)
      when the spender is the zero address
        ✓ reverts
    _mint
      ✓ rejects a null account
      for a non zero account
        ✓ increments totalSupply
        ✓ increments recipient balance
        ✓ emits Transfer event
    pausable token
      transfer
        ✓ allows to transfer when unpaused (61ms)
        ✓ allows to transfer when paused and then unpaused (115ms)
        ✓ reverts when trying to transfer when paused (65ms)
      transfer from
        ✓ allows to transfer from when unpaused (63ms)
        ✓ allows to transfer when paused and then unpaused (122ms)
        ✓ reverts when trying to transfer from when paused (63ms)
      mint
        ✓ allows to mint when unpaused (47ms)
        ✓ allows to mint when paused and then unpaused (99ms)
        ✓ reverts when trying to mint when paused (65ms)
      burn
        ✓ allows to burn when unpaused (45ms)
        ✓ allows to burn when paused and then unpaused (101ms)
        ✓ reverts when trying to burn when paused (60ms)
    burn
      when the given amount is not greater than balance of the sender
        for a zero amount
          ✓ burns the requested amount
          ✓ emits a transfer event
        for a non-zero amount
          ✓ burns the requested amount
          ✓ emits a transfer event
      when the given amount is greater than the balance of the sender
        ✓ reverts
    burnFrom
      on success
        for a zero amount
          ✓ burns the requested amount
          ✓ decrements allowance
          ✓ emits a transfer event
        for a non-zero amount
          ✓ burns the requested amount
          ✓ decrements allowance
          ✓ emits a transfer event
      when the given amount is greater than the balance of the sender
        ✓ reverts (65ms)
      when the given amount is greater than the allowance
        ✓ reverts (65ms)


  75 passing (16s)
```
