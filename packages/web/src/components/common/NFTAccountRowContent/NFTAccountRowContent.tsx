import { FC, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { theme, up, useIsMobile } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { getAvatarSize } from 'utils/common';
import { shortAddress } from 'utils/tokens';

import { AmountUSD } from '../AmountUSD';
import { NFTAvatar } from '../NFTAvatar';

import { Connection, PublicKey } from "@solana/web3.js";
import { deprecated } from "@metaplex-foundation/mpl-token-metadata";
import { result } from 'lodash';

export const NFTAvatarStyled = styled(NFTAvatar)``;

const TokenInfo = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: 22px 22px;
  grid-template-columns: 1fr 1fr;
`;

const TokenName = styled.div`
  flex: 1;

  max-width: 300px;
  overflow: hidden;

  color: ${theme.colors.textIcon.primary};

  font-weight: 700;
  font-size: 14px;
  line-height: 140%;

  ${up.tablet} {
    font-weight: 600;
    font-size: 16px;
  }

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenBalance = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 13px;
  line-height: 140%;

  ${up.tablet} {
    font-size: 14px;
  }
`;

const TokenUSD = styled.div`
  grid-row: 1 / -1;
  align-self: center;
  justify-self: flex-end;

  color: #202020;
  font-weight: 600;
  font-size: 17px;
  line-height: 140%;

  ${up.tablet} {
    font-size: 18px;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;

  &.isMobilePopupChild {
    ${TokenInfo} {
      grid-template-rows: 20px 20px;
    }

    ${TokenName} {
      font-weight: 500;
    }

    ${TokenBalance} {
      font-size: 14px;
    }

    ${TokenUSD} {
      font-size: 16px;
    }
  }

  .isSelected & {
    ${TokenName} {
      font-weight: 700;
    }

    ${TokenUSD} {
      font-weight: 700;
    }
  }
`;

interface Props {
  tokenAccount?: TokenAccount;
  isMobilePopupChild?: boolean;
}
let count = 0;
export const NFTAccountRowContent: FC<Props> = ({ tokenAccount, isMobilePopupChild }) => {
  let cadena: String = "";
  let cadena2: String = "";
  let cadena3: String = "";
  let cadena4: String = "";

  const [NFTName, setNFTName] = useState(cadena);
  const [symbol, setSymbol] = useState(cadena2);
  const [NFTAdress, setNFTAdress] = useState(cadena3);
  const [NFTImage, setNFTImage] = useState(cadena4);
  if (tokenAccount?.balance && count < 2) {
    count = count + 1;
    isNFT(tokenAccount?.balance?.token.address as string).then(result => {
      setNFTName(result.data?.data.name.toString() as string);
      setSymbol(result.data?.data.symbol.toString() as string);
      setNFTAdress(result.data?.mint as string);
      console.log(result.data?.data.symbol.toString() as String, count)
      let url = result.data?.data.uri;

      fetch(url as string)
        .then(res => res.json())
        .then(out =>{
          console.log('Checkout this JSON! ', out.image)
           setNFTImage(out.image)
        }).catch(err => {});
    });
  } else {
    console.log("NO entra")
  }
  
  const isMobile = useIsMobile();
  if (!tokenAccount) {
    return null;
  }

  const avatarSize = getAvatarSize(isMobile);

  const { loading } = tokenAccount;

  const renderTokenName = () => {
    // const tokenName =
    //   tokenAccount.balance?.token.name ||
    //   tokenAccount.balance?.token.symbol ||
    //   (tokenAccount.balance?.token.address && shortAddress(tokenAccount.balance?.token.address));

    return (
      <TokenName title={NFTAdress as string}>
        {loading ? <Skeleton width={100} height={16} /> : NFTName}
      </TokenName>
    );
  };

  const elTokenBalance = (
    <TokenBalance>
      {loading ? <Skeleton width={100} height={14} /> : <>{symbol}</>}
    </TokenBalance>
  );

  const renderTokenUSD = () => {
    if (loading) {
      return (
        <TokenUSD>
          <Skeleton width={50} height={14} />
        </TokenUSD>
      );
    }

    if (tokenAccount.balance) {
      return (
        <TokenUSD>
          <AmountUSD value={tokenAccount.balance} />
        </TokenUSD>
      );
    }

    return null;
  };

  return (
    <>
      {loading ? (
        <Skeleton height={avatarSize} width={avatarSize} borderRadius={12} />
      ) : (
        <NFTAvatarStyled
          // symbol={tokenAccount?.balance?.token.symbol}
          symbol={symbol as string}
          address={tokenAccount?.balance?.token.address}
          size={avatarSize}
          imageURL={NFTImage as string}
        />
      )}
      <Content className={classNames({ isMobilePopupChild })}>
        <TokenInfo>
          {renderTokenName()}
          {elTokenBalance}
          {renderTokenUSD()}
        </TokenInfo>
      </Content>
    </>
  );
};

const isNFT = async (key: string): Promise<deprecated.Metadata> => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  let mintPubkey = new PublicKey(key as string);
  let tokenmetaPubkey = await deprecated.Metadata.getPDA(mintPubkey);
  const tokenmeta = await deprecated.Metadata.load(connection, tokenmetaPubkey);
  return tokenmeta;
}