import { useMemo } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import { useSettings } from 'app/contexts/general/settings';

import { Connection, PublicKey } from "@solana/web3.js";
import { deprecated } from "@metaplex-foundation/mpl-token-metadata";
// import { Metaplex, Nft } from "@metaplex-foundation/js-next";
// import { clusterApiUrl } from "@solana/web3.js";

export const useTokenAccountsHidden = (): [TokenAccount[], TokenAccount[], TokenAccount[]] => {
  const userTokenAccounts = useUserTokenAccounts();
  let bool = false;
  const {
    settings: { isZeroBalancesHidden },
    tokenAccounts,
  } = useSettings();

  

  return useMemo(() => {
    const onlyTokenAccounts: TokenAccount[] = [];
    const onlyHiddenTokenAccounts: TokenAccount[] = [];
    const onlyNFT: TokenAccount[] = [];

    for (const tokenAccount of userTokenAccounts) {
      const key = tokenAccount.balance?.token.address.toString();
      const isHidden = tokenAccount.key
        ? tokenAccounts.hiddenTokenAccounts.includes(tokenAccount.key.toBase58())
        : false;

      if (isHidden) {
        onlyHiddenTokenAccounts.push(tokenAccount);
        continue;
      }

      const isZero = !tokenAccount.balance || tokenAccount.balance.equalTo(0);
      const notForceShow = tokenAccount.key
        ? !tokenAccounts.forceShowTokenAccounts.includes(tokenAccount.key.toBase58())
        : false;
      const notSOL = !tokenAccount.balance?.token.isRawSOL;

      if (isZeroBalancesHidden && isZero && notForceShow && notSOL) {
        onlyHiddenTokenAccounts.push(tokenAccount);

        continue;
      }
      
      // let flag = await isNFT(key as string);
      // if (flag){
      //   onlyNFT.push(tokenAccount);
      //   console.log("NFT", tokenAccount.balance?.numerator.toString() == "1")
      // } 
      // else {
      //   onlyTokenAccounts.push(tokenAccount);
      //   console.log("TOKEN", tokenAccount.balance?.numerator.toString())
      // }
      // if(tokenAccount.balance?.numerator) onlyNFT.push(tokenAccount);
      if(tokenAccount.balance?.numerator.toString() == "1") onlyNFT.push(tokenAccount);
      else onlyTokenAccounts.push(tokenAccount);
      // onlyTokenAccounts.push(tokenAccount);
      // console.log(await getNFT(key as string));
    }

    return [onlyTokenAccounts, onlyHiddenTokenAccounts, onlyNFT];
  }, [
    userTokenAccounts,
    isZeroBalancesHidden,
    tokenAccounts.forceShowTokenAccounts,
    tokenAccounts.hiddenTokenAccounts,
  ]);
};

const isNFT = async(key: string): Promise<boolean> =>{
  let bool = false;
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  let mintPubkey = new PublicKey(key as string);
  let tokenmetaPubkey = await deprecated.Metadata.getPDA(mintPubkey);
  await deprecated.Metadata.load(connection, tokenmetaPubkey).then(tokenmeta => {
    bool = true;
    console.log("SI");
  }).catch(error => {
    console.log("NO");
  });
  return bool;
}

// const getNFT = async (key: string): Promise<Nft> => {
//   const connection = new Connection(clusterApiUrl("mainnet-beta"));
//   const metaplex = new Metaplex(connection);
//   const mint = new PublicKey(key);
//   const nft = await metaplex.nfts().findByMint(mint);
//   return nft;
// }