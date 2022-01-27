import {Injectable, NgZone} from '@angular/core';
import Web3 from 'web3';
import MetaMaskOnboarding from '@metamask/onboarding';
import { environment } from 'environments/environment';
import detectEthereumProvider from '@metamask/detect-provider';
import { Observable, Observer, of } from 'rxjs';
import {Router} from '@angular/router';

// This interface and declaration  is necessary for typescript + web3 window behavior.
interface Web3Window extends Window {
  ethereum: any;
  web3: any;
}

declare let window: Web3Window;

@Injectable({
  providedIn: 'root' // This must stay a singleton
})
export class WalletService {

  private static forwarderOrigin = environment.metamaskForwarderOrigin;
  private static maxCachedHours: number = 24;
  metaMaskOnboarder: MetaMaskOnboarding;
  currentAccount: any;
  chainId: any;
  chainIdWatcher: Observable<any>;
  accountWatcher: Observable<any>;
  window: Web3Window;
  private chainIdObserver: Observer<any>;
  private accountObserver: Observer<any>;

  constructor(private ngZone: NgZone, private router: Router) {
    this.accountWatcher = of([]);
    this.chainIdWatcher = of([]);
    this.restoreState();
    this.initializeWeb3();
  }

  /**
   * Initializes web3 and window.ethereum object using backwards compatibility
   */
  async initializeWeb3() {
    this.window = window;
    if(!this.isMetaMaskInstalled()) {
      console.error('Metamask is not installed.');
      this.metaMaskOnboarder = new MetaMaskOnboarding({
        forwarderOrigin: WalletService.forwarderOrigin,
        forwarderMode: 'INJECT'
      });
    }

    detectEthereumProvider().then((provider) => {
      if (provider) { // Use MetaMask's injected global API.
        if(provider !== window.ethereum) {
          console.error('Do you have multiple wallets installed? Provider and window.ethereum do not match!');
        }
        window.web3 = new Web3(window.ethereum);
      } else if (window.web3) { // Deprecated backwards compatibility.
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        return;
      }

      this.setupObservablesForEthereum();
    }, (error) => { console.log(`An error occured trying to detect Ethereum provider ${error}`); });
  }

  /**
   * Prompts user to connect to MetaMask. Triggers observables for watching accounts.
   */
  connectToMetaMask() {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((_accounts) => {
        this.accountObserver.next(_accounts);
        this.updateAccount(_accounts);
      })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  }

  disconnectMetaMask() {
    // TODO: disconnect?
  }

  /**
   * Helper method to indicate if a MetaMask wallet is active.
   */
  isWalletActive() {
    return this.isMetaMaskInstalled() && Boolean(this.currentAccount);
  }

  getChain(): Observable<any> {
    if(!this.isMetaMaskInstalled()) {
      return of(-1);
    }

    return this.chainIdWatcher;
  }

  getAccounts(): Observable<any> {
    if(!this.isMetaMaskInstalled()) {
      return of([]);
    }

    return this.accountWatcher;
  };

  isMetaMaskInstalled() {
    return MetaMaskOnboarding.isMetaMaskInstalled();
  }

  beginMetaMaskOnboarding() {
    if(this.isMetaMaskInstalled()) {
      console.log('MetaMask is already installed. No onboarding required.');
      return;
    }

    this.metaMaskOnboarder.startOnboarding();
  }

  endMetaMaskOnboarding() {
    if(!this.isMetaMaskInstalled()) {
      console.log('MetaMask is not installed. Something went wrong during onboarding. Are you sure you want to stop?');
      return;
    }

    this.metaMaskOnboarder.stopOnboarding();
  }

  private setupObservablesForEthereum() {
    this.setupChainIdWatcher();
    this.setupAccountWatcher();
  }

  private setupChainIdWatcher() {
    this.chainIdWatcher = new Observable((observer: Observer<any>) => {
      this.chainIdObserver = observer;
      window.ethereum.request({ method: 'eth_chainId' }).then((_chainId) => {
        this.chainId = _chainId;
        observer.next(_chainId);
      });

      window.ethereum.on('chainChanged', (_chainId) => {
        console.warn(`Chain was changed! Was this intentional? Changed to ${_chainId}`);
        this.chainId = _chainId;
        this.ngZone.run(() => {
          this.router.navigate(['/chain-id-change']);
        });
        observer.next(_chainId);
      });
    });

    this.chainIdWatcher.subscribe(); // if we don't subscribe to it at least once, then it never triggers
  }

  private setupAccountWatcher() {
    this.accountWatcher = new Observable((observer: Observer<any>) => {
      this.accountObserver = observer;
      window.ethereum.request({ method: 'eth_accounts' }).then((_accounts) => {
        this.updateAccount(_accounts);
        observer.next(_accounts);
      });

      window.ethereum.on('accountsChanged', (_accounts) => {
        this.updateAccount(_accounts);
        observer.next(_accounts);
      });
    });

    this.accountWatcher.subscribe(); // if we don't subscribe to it at least once, then it never triggers
  }

  private updateAccount(accounts) {
    if (accounts.length === 0) { // MetaMask is locked or the user has not connected any accounts
      this.currentAccount = null;
      this.purgeCache();
    } else if (accounts[0] !== this.currentAccount) {
      this.currentAccount = accounts[0];
    }

    this.updateCache();
  }

  private restoreState() {
    const cachedAccount = localStorage.getItem('currentAccount');
    const cachedTimestamp = localStorage.getItem('accountLastActive');

    if(Boolean(cachedAccount && cachedTimestamp) === false) {
      return;
    }

    const diffInMillis = Date.now() - Date.parse(cachedTimestamp);
    if(Math.floor(diffInMillis / 1000 / 60 / 60 ) > WalletService.maxCachedHours) {
      this.purgeCache();
    } else {
      this.currentAccount = cachedAccount;
    }
  }

  private purgeCache() {
    localStorage.removeItem('currentAccount');
    localStorage.removeItem('accountLastActive');
  }

  private updateCache() {
    localStorage.setItem('currentAccount', this.currentAccount);
    localStorage.setItem('accountLastActive', Date.now().toString());
  }
}
