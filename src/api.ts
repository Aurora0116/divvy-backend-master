import axios from 'axios';
import { transferWithdrawal } from './addMultiplierOnChain';
import { DB_API_URL } from './constants/config';
import { ConfigResponseData, WalletResponseData } from './models';

export const routeRegister = async (req, res) => {
    const { address, name } = req.body;
    if (!address || !name) res.error('Invalid username and wallet address');
    try {
        console.log(`--> API Request: register wallet ${name}-${address}`);

        /// Create new User
        let ret = await axios.post(`${DB_API_URL}/moonshot/v1/user`, { name });
        if (!ret.data || ret.data.ID == undefined || ret.data.ID == 0) {
            res.send({ err: 'Register Error: Invalid user ID from DB API while user create' });
            return;
        }
        const user_id = ret.data.ID;

        /// Create new Wallet
        ret = await axios.post(`${DB_API_URL}/moonshot/v1/wallet`, { "wallet_address": address, user_id });
        console.log('  New wallet created ', ret.data.ID);
        res.send({ status: 'success', data: { user_id } });
    } catch (e) {
        const msg = `Register Error: ${e.msg || e.message || e}`;
        res.send({ err: msg });
    }
}

export const routeDeposit = async (req, res) => {
    const { address, amount, txid } = req.body;
    if (!address || amount === undefined || !txid) res.error('Invalid wallet address or tx id');
    try {
        console.log(`--> API Request: deposited SOL ${amount}-${address}`);

        if (!address) return { err: 'Empty address' };
        // console.log(`  -> API Request: get wallet info by address: ${address}`);
        let result = await axios.get(`${DB_API_URL}/moonshot/v1/wallet?wallet_address=${address}`);
        let ret = result.data as WalletResponseData;

        /// Update Wallet Balance
        result = await axios.put(`${DB_API_URL}/moonshot/v1/wallet`, {
            ...ret,
            trading_balance: ret.trading_balance + amount as number,
        });
        console.log('  Deposit success', ret.trading_balance + amount);
        res.send({ status: 'success', data: { f_bal: ret.trading_balance + amount as number } });
    } catch (e) {
        const msg = `Deposite Error: ${e.msg || e.message || e}`;
        console.log('  ', msg);
        res.send({ err: msg });
    }
}

export const routeWithdraw = async (req, res) => {
    const { address, amount } = req.body;
    if (!address || amount === undefined) res.error('Invalid wallet address');
    try {
        console.log(`--> API Request: withdrawed SOL ${amount}-${address}`);

        if (!address) return { err: 'Empty address' };
        // console.log(`  -> API Request: get wallet info by address: ${address}`);
        let result = await axios.get(`${DB_API_URL}/moonshot/v1/wallet?wallet_address=${address}`);
        let ret = result.data as WalletResponseData;

        if (ret.trading_balance < amount) {
            res.send({ err: 'Insufficient funding balance' });
            return;
        }
        const tx_res = await transferWithdrawal(address, amount);

        /// Update Wallet Balance
        result = await axios.put(`${DB_API_URL}/moonshot/v1/wallet`, {
            ...ret,
            trading_balance: ret.trading_balance - amount as number,
        });

        console.log('  Withdraw success', ret.trading_balance - amount);
        res.send({ status: 'success', data: { f_bal: ret.trading_balance - amount as number, tx_id: tx_res.result } });
    } catch (e) {
        const msg = `Withdraw Error: ${e.msg || e.message || e}`;
        console.log('  ', msg);
        res.send({ err: msg });
    }
}

export const getConfigFromDB = async () => {
    try {
        console.log(`--> API Request: get configs`);
        let result = await axios.get(`${DB_API_URL}/moonshot/v1/config`);
        let ret: ConfigResponseData = result.data;
        console.log('  Fetch config success');
        return ret;
    } catch (e) {
        const msg = `Fetch Config Error: ${e.msg || e.message || e}`;
        console.log('  ', msg);
        return undefined;
    }
}

export const updateDBConfig = async (min: number, max: number) => {
    try {
        console.log(`--> API Request: update configs`);
        let newConfig = await getConfigFromDB();
        if (!newConfig) return;

        newConfig.min = min;
        newConfig.max = max;
        await axios.put(`${DB_API_URL}/moonshot/v1/config`, newConfig);
        console.log('  Update config success');
    } catch (e) {
        const msg = `Update Config Error: ${e.msg || e.message || e}`;
        console.log('  ', msg);
        return undefined;
    }
}

// export const getRedisInfo = async (key: string) => {
//     try {
//         console.log(`--> API Request: get redis info`);
//         let result = await axios.get(`${DB_API_URL}/moonshot/v1/keys/${key}`);
//         let ret = result.data;
//         console.log('  Fetch config success');
//         return JSON.parse(ret);
//     } catch (e) {
//         const msg = `Fetch Config Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         return undefined;
//     }
// }

// export const setRedisInfo = async (key: string, data: any) => {
//     try {
//         console.log(`--> API Request: post redis info`);
//         let result = await axios.post(`${DB_API_URL}/moonshot/v1/keys/${key}`, JSON.stringify(data));
//         let ret = result.data;
//         console.log('  Fetch config success');
//         return ret;
//     } catch (e) {
//         const msg = `Fetch Config Error: ${e.msg || e.message || e}`;
//         console.log('  ', msg);
//         return undefined;
//     }
// }