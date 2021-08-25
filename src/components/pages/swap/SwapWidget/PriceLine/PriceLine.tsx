import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { useMint, useSwapContext, useSwapFair, useTokenMap } from '@project-serum/swap-ui';

// import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 26px 20px;

  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

export const Left = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
`;

const Rate = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: -8px;

  color: #000;
`;

// const ChangeRateWrapper = styled.div`
//   margin-left: 20px;
//
//   cursor: pointer;
// `;
//
// const ChangeRateIcon = styled(Icon)`
//   display: flex;
//   width: 24px;
//   height: 24px;
//
//   color: #a3a5ba;
// `;

export const PriceLine: FC = () => {
  const { fromMint, toMint } = useSwapContext();
  const fromMintInfo = useMint(fromMint);
  const fair = useSwapFair();

  const tokenMap = useTokenMap();
  const fromTokenInfo = tokenMap.get(fromMint.toString());
  const toTokenInfo = tokenMap.get(toMint.toString());

  // const handleChangeRateClick = () => {};

  return (
    <Wrapper>
      <Left>Current price</Left>
      <Right>
        <Rate>
          {fair !== undefined && toTokenInfo && fromTokenInfo
            ? `1 ${toTokenInfo.symbol} = ${fair.toFixed(fromMintInfo?.decimals)} ${
                fromTokenInfo.symbol
              }`
            : `-`}
          {/* <ChangeRateWrapper onClick={handleChangeRateClick}> */}
          {/*  <ChangeRateIcon name="swap" /> */}
          {/* </ChangeRateWrapper> */}
        </Rate>
      </Right>
    </Wrapper>
  );
};