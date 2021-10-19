import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { NavLink, useLocation } from 'react-router-dom';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { Feature } from 'flagged';

import { forgetWallet } from 'api/wallet/ManualWallet';
import AppStoreBadge from 'assets/images/app-store-badge.png';
import GooglePlayBadge from 'assets/images/google-play-badge.png';
import { Layout } from 'components/common/Layout';
import { UsernameAddressWidget } from 'components/common/UsernameAddressWidget';
import { WidgetPage } from 'components/common/WidgetPage';
import { Accordion, Icon, Select, Switch } from 'components/ui';
import { MenuItem } from 'components/ui/Select/MenuItem';
import { appStorePath, playStorePath } from 'config/constants';
import { FEATURE_SETTINGS_FREE_TRANSACTIONS, FEATURE_SETTINGS_LIST } from 'config/featureFlags';
import { disconnect, updateSettings } from 'store/slices/wallet/WalletSlice';
import { trackEvent } from 'utils/analytics';
import { useUsername } from 'utils/hooks/useUsername';
import { appearance, currencies } from 'utils/settings';
import { WalletSettings } from 'utils/types';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 24px;
`;

const ItemsWrapper = styled.div`
  margin-top: 10px;
  padding: 20px;

  border-bottom: 1px solid #f6f6f8;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;

  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const ItemTitle = styled.div`
  display: flex;
  flex-grow: 1;

  font-size: 16px;
  font-weight: 600;
`;

const ItemAction = styled.div`
  display: flex;
  align-items: center;
`;

const LogoutWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const Logout = styled.div`
  padding: 0 10px;
  font-size: 16px;
  font-weight: 600;

  color: #f43d3d;

  cursor: pointer;
`;

const CurrencyItem = styled.div``;

const Symbol = styled.span`
  padding-left: 3px;

  color: #a3a5ba;
`;

const Capitalize = styled.span`
  text-transform: capitalize;
`;

const Title = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;

  text-align: right;

  &.overflow-ellipsis {
    width: 250px;
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const ChevronIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  margin-left: 20px;

  transform: rotate(270deg);
`;

const AccordionItem = styled.div`
  margin-bottom: 8px;
`;

const AccordionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  width: 95%;
`;

const AccordionTitlePrimary = styled.div``;

const AccordionTitleSecondary = styled.div`
  &.warning {
    color: #f43d3d;
  }
`;

const MobileButtons = styled.div`
  display: flex;
  justify-content: space-between;

  width: 263px;
  padding: 5px 0;
`;

const Text = styled.div`
  margin-bottom: 20px;
`;

export const Settings: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.wallet.settings);
  const publicKey = useSelector((state) => state.wallet.publicKey);
  const { username, domain } = useUsername();

  useEffect(() => {
    trackEvent('settings_open', { fromPage: location.state.fromPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogoutClick = () => {
    trackEvent('settings_logout_click');
    forgetWallet();
    void dispatch(disconnect());
  };

  const onItemClickHandler = (option: Partial<WalletSettings> = settings) => () => {
    dispatch(updateSettings(option));
  };

  const { network } = settings;

  return (
    <Layout
      rightColumn={
        <Wrapper>
          <WidgetPage icon="gear" title="Settings">
            <ItemsWrapper>
              <Feature name={FEATURE_SETTINGS_LIST}>
                <Item>
                  <ItemTitle>Currency</ItemTitle>
                  <ItemAction>
                    <Select value={settings.currency}>
                      {currencies.map(({ ticker, name, symbol }) => (
                        <MenuItem
                          key={ticker}
                          isSelected={ticker === settings.currency}
                          onItemClick={onItemClickHandler({ currency: ticker })}>
                          <CurrencyItem>
                            {name}
                            <Symbol>{`(${symbol})`}</Symbol>
                          </CurrencyItem>
                        </MenuItem>
                      ))}
                    </Select>
                  </ItemAction>
                </Item>
                <Item>
                  <ItemTitle>Appearance</ItemTitle>
                  <ItemAction>
                    <Select value={settings.appearance}>
                      {appearance.map((value) => (
                        <MenuItem
                          key={value}
                          isSelected={value === settings.appearance}
                          onItemClick={onItemClickHandler({ appearance: value })}>
                          <Capitalize>{value}</Capitalize>
                        </MenuItem>
                      ))}
                    </Select>
                  </ItemAction>
                </Item>
              </Feature>
              <AccordionItem>
                <Accordion
                  open={(location.state as any)?.isUsernameActive}
                  title={
                    <AccordionTitle>
                      <AccordionTitlePrimary>Username</AccordionTitlePrimary>
                      <AccordionTitleSecondary className={classNames({ warning: !username })}>
                        {username ? `${username}${domain}` : 'Not yet reserved'}
                      </AccordionTitleSecondary>
                    </AccordionTitle>
                  }>
                  {username ? (
                    <>
                      <Text>
                        Your P2P username allows you to receive any token within the Solana network
                        even if it is not included in your wallet list.
                      </Text>
                      <UsernameAddressWidget
                        address={publicKey || ''}
                        username={`${username}${domain}`}
                      />
                    </>
                  ) : (
                    <>
                      <Text>
                        You can receive and send tokens using your P2P username or link. Also,
                        users, who know your URL or username can send you any token, even if you
                        don’t have it in your wallets list.
                      </Text>
                      <div>You can access the feature in the app</div>
                      <MobileButtons>
                        <NavLink
                          to={{ pathname: playStorePath }}
                          target="_blank"
                          className="button">
                          <img
                            src={GooglePlayBadge}
                            width="135"
                            height="40"
                            alt="Download P2P Wallet at the Google Play Store"
                          />
                        </NavLink>
                        <NavLink to={{ pathname: appStorePath }} target="_blank" className="button">
                          <img
                            src={AppStoreBadge}
                            width="120"
                            height="40"
                            alt="Download P2P Wallet from the App Store"
                          />
                        </NavLink>
                      </MobileButtons>
                    </>
                  )}
                </Accordion>
              </AccordionItem>
              <Item>
                <ItemTitle>Network</ItemTitle>
                <ItemAction
                  onClick={() => {
                    history.push('/settings/network');
                  }}
                  style={{ cursor: 'pointer' }}>
                  <Title className="overflow-ellipsis">{network.endpoint}</Title>
                  <ChevronWrapper
                    onClick={() => {
                      history.push('/settings/network');
                    }}>
                    <ChevronIcon name="chevron" />
                  </ChevronWrapper>
                </ItemAction>
              </Item>
              <Item>
                <ItemTitle>Hide zero balances</ItemTitle>
                <ItemAction>
                  <Switch
                    checked={settings.isZeroBalancesHidden}
                    onChange={(checked) => {
                      trackEvent('settings_hide_zero_balances_click', {
                        hide: checked,
                      });
                      onItemClickHandler({
                        isZeroBalancesHidden: checked,
                      })();
                    }}
                  />
                </ItemAction>
              </Item>
              <Feature name={FEATURE_SETTINGS_FREE_TRANSACTIONS}>
                <Item>
                  <ItemTitle>Use free transactions</ItemTitle>
                  <ItemAction>
                    <Switch
                      checked={settings.useFreeTransactions}
                      onChange={(checked) =>
                        onItemClickHandler({
                          useFreeTransactions: checked,
                        })()
                      }
                    />
                  </ItemAction>
                </Item>
              </Feature>
            </ItemsWrapper>
            <LogoutWrapper>
              <Logout onClick={handleLogoutClick}>Logout now</Logout>
            </LogoutWrapper>
          </WidgetPage>
        </Wrapper>
      }
    />
  );
};
