import { FunctionComponent, HTMLAttributes, useEffect } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { useTokenAccountsHidden } from 'app/contexts/general/settings';
import { Icon } from 'components/ui';

import { TokenAccountList } from './TokenAccountList';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { Nfts } from 'pages/Nfts';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  margin-bottom: 16px;

  ${up.tablet} {
    grid-gap: 16px;

    margin: 0 18px 16px 24px;
  }
`;

const Title = styled.div`
  position: relative;

  display: flex;
  margin-left: 16px;
  padding: 16px 0 0 12px;

  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;

  cursor: pointer;

  ${up.tablet} {
    margin-left: initial;
    padding-left: 8px;
  }
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: ${theme.colors.textIcon.secondary};
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  transform: rotate(0deg);
  cursor: pointer;

  &.isOpen {
    transform: rotate(180deg);
  }
`;

type Props = {};

export const TokensWidget: FunctionComponent<Props & HTMLAttributes<HTMLDivElement>> = ({
  className,
}) => {
  let arreglo1: TokenAccount[] = [];
  // const [NFTS, setNFTS] = useState(arreglo1);
  // useEffect(() => {
  //   useTokenAccountsHidden().then(result => {
  //     setNFTS(result[2]);
  //   });
  // }, []);
  const[tokenAccounts, hiddenTokenAccounts, NFTS] = useTokenAccountsHidden();

  // const[tokenAccounts, hiddenTokenAccounts, NFTS] = useTokenAccountsHidden();
  return (
    <Wrapper className={className}>
      <Title>NFTs</Title>
      <TokenAccountList items={NFTS} />
    </Wrapper>
  );
};
