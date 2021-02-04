import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import Decimal from 'decimal.js';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { Icon } from 'components/ui';
import { SearchInput } from 'components/ui/SearchInput';
import { RootState } from 'store/rootReducer';
import { getMinimumBalanceForRentExemption } from 'store/slices/wallet/WalletSlice';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 2px;
`;

const SearchInputStyled = styled(SearchInput)`
  margin: 15px 20px 0;
`;

const EmptyBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 8em 0;
`;

const EmptyBlockText = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const EmptyBlockDesc = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;

type Props = {
  items?: Token[];
  closeModal: () => void;
};

export const TokenList: FunctionComponent<Props> = ({ items, closeModal }) => {
  const dispatch = useDispatch();
  const [fee, setFee] = useState(0);
  const [rawFee, setRawFee] = useState(0);
  const [filter, setFilter] = useState('');
  const publicKey = useSelector((state: RootState) => state.wallet.publicKey);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const solAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

  useEffect(() => {
    const mount = async () => {
      try {
        // TODO: not 0
        const resultFee = unwrapResult(await dispatch(getMinimumBalanceForRentExemption(0)));
        setRawFee(resultFee);
        setFee(
          new Decimal(resultFee)
            .div(10 ** 9)
            .toDecimalPlaces(9)
            .toNumber(),
        );
      } catch (error) {
        console.log(error);
      }
    };

    void mount();
  }, []);

  const filteredItems = useMemo(() => {
    if (!items) {
      return;
    }

    const filterLower = filter.toLowerCase();

    return filterLower.length > 0
      ? items.filter(
          (item) =>
            item.symbol?.toLowerCase().includes(filterLower) ||
            item.name?.toLowerCase().includes(filterLower),
        )
      : items;
  }, [filter, items]);

  if (!items) {
    return null;
  }

  const handleFilterChange = (value: string) => {
    const nextFilter = value.trim();
    setFilter(nextFilter);
  };

  const isInfluencedFunds = Boolean(solAccount?.balance.lt(rawFee));

  return (
    <Wrapper>
      <SearchInputStyled placeholder="Search token" value={filter} onChange={handleFilterChange} />
      {filteredItems?.length ? (
        filteredItems.map((token) => (
          <TokenRow
            key={token.address.toBase58()}
            token={token}
            fee={fee}
            isInfluencedFunds={isInfluencedFunds}
            closeModal={closeModal}
          />
        ))
      ) : (
        <EmptyBlock>
          <Icon name="search" width="100" height="100" />
          <EmptyBlockText>Nothing found</EmptyBlockText>
          <EmptyBlockDesc>Change your search phrase and try again</EmptyBlockDesc>
        </EmptyBlock>
      )}
    </Wrapper>
  );
};
